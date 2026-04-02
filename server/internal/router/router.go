package router

import (
	"caffe-dalley-backend/internal/handler"
	"caffe-dalley-backend/internal/middleware"

	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
	categoryHandler *handler.CategoryHandler,
	unitHandler *handler.UnitHandler,
	settingHandler *handler.SettingHandler,
	productHandler *handler.ProductHandler,
	inventoryHandler *handler.InventoryHandler,
	supplierHandler *handler.SupplierHandler,
	purchaseOrderHandler *handler.PurchaseOrderHandler,
	barcodeHandler *handler.BarcodeHandler,
	reportHandler *handler.ReportHandler,
	notificationHandler *handler.NotificationHandler,
	activityLogHandler *handler.ActivityLogHandler,
	authMiddleware gin.HandlerFunc,
	rbacMiddleware gin.HandlerFunc,
) *gin.Engine {
	r := gin.New()

	// Global Middlewares
	r.Use(middleware.SecurityHeadersInterceptor())
	r.Use(middleware.LoggerInterceptor())
	r.Use(gin.Recovery()) // Standard Gin recovery

	// CORS Setup
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true // Change to specific origins in production
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

	// API Routes Group
	api := r.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "API is up and running"})
		})

		// Auth Public Routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", middleware.RateLimiter(5, 15*time.Minute, "login"), authHandler.Login)
			auth.POST("/refresh", middleware.RateLimiter(10, 15*time.Minute, "refresh"), authHandler.Refresh)
		}

		// Auth Protected Routes (with Rate Limiting 300req/min and RBAC)
		authProtected := api.Group("/auth")
		authProtected.Use(authMiddleware)
		authProtected.Use(rbacMiddleware)
		authProtected.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			authProtected.POST("/logout", authHandler.Logout)
			authProtected.GET("/me", authHandler.GetMe)
			authProtected.PATCH("/me", authHandler.GetMe) // Placeholder for update me
			authProtected.POST("/me/avatar", authHandler.UploadAvatar)
			authProtected.POST("/change-password", middleware.RateLimiter(3, 1*time.Hour, "pwd"), authHandler.ChangePassword)
		}

		// Users Routes (Admin / Owner only via Casbin)
		users := api.Group("/users")
		users.Use(authMiddleware)
		users.Use(rbacMiddleware)
		users.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			users.POST("", userHandler.Create)
			users.GET("", userHandler.FindAll)
			users.GET("/:id", userHandler.FindByID)
			users.PUT("/:id", userHandler.Update)
			users.DELETE("/:id", userHandler.Delete)
		}

		// Units Routes
		units := api.Group("/units")
		units.Use(authMiddleware)
		units.Use(rbacMiddleware)
		units.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			units.POST("", unitHandler.Create)
			units.GET("", unitHandler.FindAll)
			units.GET("/:id", unitHandler.FindByID)
			units.PUT("/:id", unitHandler.Update)
			units.DELETE("/:id", unitHandler.Delete)
		}


		// Settings Routes
		settings := api.Group("/settings")
		settings.Use(authMiddleware)
		settings.Use(rbacMiddleware)
		settings.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			settings.GET("", settingHandler.FindAll)
			settings.GET("/:id", settingHandler.FindByID)
			settings.PUT("/:id", settingHandler.Save)
		}

		// Products Routes
		products := api.Group("/products")
		products.Use(authMiddleware)
		products.Use(rbacMiddleware)
		products.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			products.POST("", productHandler.Create)
			products.GET("", productHandler.FindAll)
			products.GET("/:id", productHandler.FindByID)
			products.PUT("/:id", productHandler.Update)
			products.DELETE("/:id", productHandler.Delete)
		}

		// Inventory Routes
		inventory := api.Group("/inventory")
		inventory.Use(authMiddleware)
		inventory.Use(rbacMiddleware)
		inventory.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			inventory.POST("/stock-in", inventoryHandler.StockIn)
			inventory.POST("/stock-out", inventoryHandler.StockOut)
			inventory.POST("/adjustment", inventoryHandler.StockAdjustment)
			inventory.POST("/opname", inventoryHandler.StockOpname)
			inventory.GET("/summary", inventoryHandler.GetSummaries)
			inventory.GET("/movements", inventoryHandler.GetLedgers)
		}

		// Categories Routes
		categories := api.Group("/categories")
		categories.Use(authMiddleware)
		categories.Use(rbacMiddleware)
		categories.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			categories.POST("", categoryHandler.Create)
			categories.GET("", categoryHandler.FindAll)
			categories.GET("/:id", categoryHandler.FindByID)
			categories.PUT("/:id", categoryHandler.Update)
			categories.DELETE("/:id", categoryHandler.Delete)
		}

		// Suppliers Routes
		suppliers := api.Group("/suppliers")
		suppliers.Use(authMiddleware)
		suppliers.Use(rbacMiddleware)
		suppliers.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			suppliers.POST("", supplierHandler.Create)
			suppliers.GET("", supplierHandler.FindAll)
			suppliers.GET("/:id", supplierHandler.FindByID)
			suppliers.PUT("/:id", supplierHandler.Update)
			suppliers.DELETE("/:id", supplierHandler.Delete)
		}

		// Purchase Orders Routes
		purchaseOrders := api.Group("/purchase-orders")
		purchaseOrders.Use(authMiddleware)
		purchaseOrders.Use(rbacMiddleware)
		purchaseOrders.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			purchaseOrders.POST("", purchaseOrderHandler.Create)
			purchaseOrders.GET("", purchaseOrderHandler.FindAll)
			purchaseOrders.GET("/:id", purchaseOrderHandler.FindByID)
			purchaseOrders.GET("/:id/history", purchaseOrderHandler.GetHistory)
			purchaseOrders.PUT("/:id", purchaseOrderHandler.Update)
			purchaseOrders.PUT("/:id/status", purchaseOrderHandler.UpdateStatus)
		}

		// Barcode Routes
		barcodeGroup := api.Group("/barcode")
		barcodeGroup.Use(authMiddleware)
		barcodeGroup.Use(rbacMiddleware)
		barcodeGroup.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			barcodeGroup.GET("/product/:id", barcodeHandler.Generate)
			barcodeGroup.POST("/lookup", barcodeHandler.Lookup)
		}

		// Reports Routes
		reports := api.Group("/reports")
		reports.Use(authMiddleware)
		reports.Use(rbacMiddleware)
		reports.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			reports.GET("/dashboard", reportHandler.GetDashboard)
			reports.GET("/stock", reportHandler.GetStockReport)
			reports.GET("/movements", reportHandler.GetMovementReport)
			reports.GET("/purchases", reportHandler.GetPurchaseReport)
		}

		// Notifications Routes
		notifications := api.Group("/notifications")
		notifications.Use(authMiddleware)
		notifications.Use(rbacMiddleware)
		notifications.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			notifications.GET("", notificationHandler.FindMyNotifications)
			notifications.GET("/unread-count", notificationHandler.GetUnreadCount)
			notifications.PUT("/:id/read", notificationHandler.MarkAsRead)
			notifications.PUT("/read-all", notificationHandler.MarkAllAsRead)
			notifications.POST("", notificationHandler.Create)
			notifications.DELETE("/:id", notificationHandler.Delete)
		}

		// Activity Logs Routes
		activityLogs := api.Group("/activity-logs")
		activityLogs.Use(authMiddleware)
		activityLogs.Use(rbacMiddleware)
		activityLogs.Use(middleware.RateLimiter(300, 1*time.Minute, "api"))
		{
			activityLogs.GET("", activityLogHandler.FindLatest)
		}
	}

	return r
}
