package main

import (
	"fmt"

	"caffe-dalley-backend/internal/config"
	"caffe-dalley-backend/internal/database"
	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/handler"
	"caffe-dalley-backend/internal/middleware"
	"caffe-dalley-backend/internal/repository"
	"caffe-dalley-backend/internal/router"
	"caffe-dalley-backend/internal/service"
	"caffe-dalley-backend/pkg/logger"
	"caffe-dalley-backend/pkg/token"
	"caffe-dalley-backend/pkg/upload"

	"github.com/casbin/casbin/v2"
)

func main() {
	// Initialize Config
	cfg, err := config.LoadConfig(".env")
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		return
	}

	// Initialize Logger
	logger.InitLogger(cfg.Env)

	// Initialize Postgres
	if err := database.InitPostgres(cfg); err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	// Initialize Redis
	if err := database.InitRedis(cfg); err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to connect to Redis")
	}

	if err := upload.InitMinio(cfg); err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to connect to MinIO")
	}

	// Auto Migrate DB
	err = database.DB.AutoMigrate(
		&domain.User{}, &domain.RefreshToken{}, &domain.Category{}, 
		&domain.Unit{}, &domain.BusinessSetting{}, 
		&domain.Product{}, &domain.StockLedger{}, &domain.StockSummary{},
		&domain.Supplier{}, &domain.PurchaseOrder{}, &domain.PurchaseOrderItem{},
		&domain.ActivityLog{}, &domain.Notification{},
	)
	if err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to migrate database")
	}

	// Dependencies Injection
	userRepo := repository.NewUserRepository(database.DB)
	activityLogRepo := repository.NewActivityLogRepository(database.DB)
	activityLogService := service.NewActivityLogService(activityLogRepo)
	activityLogHandler := handler.NewActivityLogHandler(activityLogService)

	tokenMaker, err := token.NewTokenMaker(cfg.RSAPrivateKeyPath, cfg.RSAPublicKeyPath)
	if err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to create token maker")
	}

	authService := service.NewAuthService(userRepo, tokenMaker, cfg)
	authHandler := handler.NewAuthHandler(authService, activityLogService)
	authMiddleware := middleware.AuthMiddleware(tokenMaker)

	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	categoryRepo := repository.NewCategoryRepository(database.DB)
	categoryService := service.NewCategoryService(categoryRepo)
	categoryHandler := handler.NewCategoryHandler(categoryService)

	unitRepo := repository.NewUnitRepository(database.DB)
	unitService := service.NewUnitService(unitRepo)
	unitHandler := handler.NewUnitHandler(unitService)

	settingRepo := repository.NewSettingRepository(database.DB)
	settingService := service.NewSettingService(settingRepo)
	settingHandler := handler.NewSettingHandler(settingService)

	productRepo := repository.NewProductRepository(database.DB)
	inventoryRepo := repository.NewInventoryRepository(database.DB)
	productService := service.NewProductService(productRepo, categoryRepo, unitRepo, inventoryRepo, cfg)
	productHandler := handler.NewProductHandler(productService, activityLogService)

	supplierRepo := repository.NewSupplierRepository(database.DB)
	supplierService := service.NewSupplierService(supplierRepo, cfg)
	supplierHandler := handler.NewSupplierHandler(supplierService)

	purchaseOrderRepo := repository.NewPurchaseOrderRepository(database.DB)

	inventoryService := service.NewInventoryService(database.DB, inventoryRepo, productRepo, purchaseOrderRepo)
	inventoryHandler := handler.NewInventoryHandler(inventoryService, activityLogService)

	purchaseOrderService := service.NewPurchaseOrderService(purchaseOrderRepo, inventoryService, productRepo)
	purchaseOrderHandler := handler.NewPurchaseOrderHandler(purchaseOrderService, activityLogService)

	barcodeHandler := handler.NewBarcodeHandler(productRepo, inventoryRepo)

	reportService := service.NewReportService(inventoryRepo, purchaseOrderRepo, productRepo)
	reportHandler := handler.NewReportHandler(reportService)

	notificationRepo := repository.NewNotificationRepository(database.DB)
	notificationService := service.NewNotificationService(notificationRepo)
	notificationHandler := handler.NewNotificationHandler(notificationService)

	// Casbin Enforcer
	enforcer, err := casbin.NewEnforcer("casbin/model.conf", "casbin/policy.csv")
	if err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to initialize Casbin enforcer")
	}
	rbacMiddleware := middleware.RBACMiddleware(enforcer)

	// Setup Router
	r := router.SetupRouter(
		authHandler,
		userHandler,
		categoryHandler,
		unitHandler,
		settingHandler,
		productHandler,
		inventoryHandler,
		supplierHandler,
		purchaseOrderHandler,
		barcodeHandler,
		reportHandler,
		notificationHandler,
		activityLogHandler,
		authMiddleware,
		rbacMiddleware,
	)

	// Start Server
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	logger.Log.Info().Msgf("Server listening on port %s in %s mode", port, cfg.Env)
	if err := r.Run(":" + port); err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to start server")
	}
}
