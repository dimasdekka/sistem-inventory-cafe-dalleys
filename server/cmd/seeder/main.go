package main

import (
	"fmt"

	"caffe-dalley-backend/internal/config"
	"caffe-dalley-backend/internal/database"
	"caffe-dalley-backend/internal/domain"
	"caffe-dalley-backend/internal/repository"
	"caffe-dalley-backend/pkg/logger"
	"caffe-dalley-backend/pkg/password"
)

func main() {
	cfg, err := config.LoadConfig(".env")
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		return
	}

	logger.InitLogger(cfg.Env)

	if err := database.InitPostgres(cfg); err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	userRepo := repository.NewUserRepository(database.DB)
	unitRepo := repository.NewUnitRepository(database.DB)
	categoryRepo := repository.NewCategoryRepository(database.DB)

	// Seed default users (roles disesuaikan dengan Casbin: Owner, Manager, Admin, Staff)
	users := []domain.User{
		{
			Name:     "Budi Santoso",
			Email:    "owner@dalley.id",
			Role:     "Owner",
			IsActive: true,
		},
		{
			Name:     "Sari Dewi",
			Email:    "manajer@dalley.id",
			Role:     "Manager",
			IsActive: true,
		},
		{
			Name:     "Eko Prasetyo",
			Email:    "admin@dalley.id",
			Role:     "Admin",
			IsActive: true,
		},
		{
			Name:     "Rudi Hartono",
			Email:    "gudang@dalley.id",
			Role:     "Staff",
			IsActive: true,
		},
		{
			Name:     "Dian Pratiwi",
			Email:    "barista@dalley.id",
			Role:     "Staff",
			IsActive: true,
		},
	}

	hashedPassword, _ := password.HashPassword("Password1")

	for _, u := range users {
		existing, _ := userRepo.FindByEmail(u.Email)
		if existing == nil {
			u.Password = hashedPassword
			if err := userRepo.Create(&u); err != nil {
				logger.Log.Error().Err(err).Msgf("Failed to seed user %s", u.Email)
			} else {
				logger.Log.Info().Msgf("Successfully seeded user: %s", u.Email)
			}
		} else {
			// Always sync role and password to ensure they match seeder config
			needsUpdate := false
			if existing.Role != u.Role {
				existing.Role = u.Role
				needsUpdate = true
				logger.Log.Info().Msgf("Updating role for user %s to %s", u.Email, u.Role)
			}
			// Reset password to seeder value so login always works after re-seed
			existing.Password = hashedPassword
			needsUpdate = true

			if needsUpdate {
				if err := userRepo.Update(existing); err != nil {
					logger.Log.Error().Err(err).Msgf("Failed to update user %s", u.Email)
				} else {
					logger.Log.Info().Msgf("Synced user %s (role: %s, password reset)", u.Email, existing.Role)
				}
			}
		}
	}

	// Seed default units
	defaultUnits := []domain.Unit{
		{Name: "Pieces", Symbol: "pcs", Description: "Satuan unit umum / biji"},
		{Name: "Kilogram", Symbol: "kg", Description: "Berat dalam kilogram"},
		{Name: "Gram", Symbol: "g", Description: "Berat dalam gram"},
		{Name: "Liter", Symbol: "L", Description: "Volume dalam liter"},
		{Name: "Milliliter", Symbol: "ml", Description: "Volume dalam milliliter"},
	}

	for _, du := range defaultUnits {
		// Cek berdasarkan symbol agar idempotent
		existingUnits, err := unitRepo.FindAll()
		if err != nil {
			logger.Log.Error().Err(err).Msg("Failed to fetch units during seeding")
			break
		}
		found := false
		for _, u := range existingUnits {
			if u.Symbol == du.Symbol {
				found = true
				break
			}
		}
		if !found {
			if err := unitRepo.Create(&du); err != nil {
				logger.Log.Error().Err(err).Msgf("Failed to seed unit %s", du.Symbol)
			} else {
				logger.Log.Info().Msgf("Successfully seeded unit: %s", du.Symbol)
			}
		}
	}


	// Seed default categories (top-level only)
	defaultCategories := []domain.Category{
		{Name: "Bahan Baku Kopi", Description: "Biji kopi, gula, susu, dll"},
		{Name: "Minuman", Description: "Menu minuman jadi"},
		{Name: "Makanan", Description: "Snack / makanan pendamping"},
		{Name: "Kemasan & Perlengkapan", Description: "Cup, tutup, sedotan, dll"},
	}

	for _, dc := range defaultCategories {
		existingCategories, err := categoryRepo.FindAll()
		if err != nil {
			logger.Log.Error().Err(err).Msg("Failed to fetch categories during seeding")
			break
		}
		found := false
		for _, c := range existingCategories {
			if c.Name == dc.Name {
				found = true
				break
			}
		}
		if !found {
			if err := categoryRepo.Create(&dc); err != nil {
				logger.Log.Error().Err(err).Msgf("Failed to seed category %s", dc.Name)
			} else {
				logger.Log.Info().Msgf("Successfully seeded category: %s", dc.Name)
			}
		}
	}

	productRepo := repository.NewProductRepository(database.DB)

	// Fetch dependencies
	cats, _ := categoryRepo.FindAll()
	var catKopi, catMakanan *domain.Category
	for _, c := range cats {
		if c.Name == "Bahan Baku Kopi" { catKopi = c }
		if c.Name == "Makanan" { catMakanan = c }
	}

	units, _ := unitRepo.FindAll()
	var unitKg, unitPcs *domain.Unit
	for _, u := range units {
		if u.Symbol == "kg" { unitKg = u }
		if u.Symbol == "pcs" { unitPcs = u }
	}

	// Seed Suppliers
	defaultSuppliers := []domain.Supplier{
		{
			Name:    "PT Sedap Makmur",
			Email:   "sales@sedapmakmur.co.id",
			Phone:   "081234567890",
			Address: "Jl. Sudirman No 42, Jakarta",
		},
		{
			Name:    "CV Kopi Nusantara",
			Email:   "info@kopinusantara.id",
			Phone:   "081987654321",
			Address: "Jl. Merdeka No 17, Bandung",
		},
	}

	for _, ds := range defaultSuppliers {
		var existing domain.Supplier
		if err := database.DB.Where("name = ?", ds.Name).First(&existing).Error; err != nil {
			database.DB.Create(&ds)
			logger.Log.Info().Msgf("Successfully seeded supplier: %s", ds.Name)
		}
	}

	// Seed Products
	bc1 := "899123456001"
	bc2 := "899123456002"
	bc3 := "899123456003"
	
	if catKopi != nil && unitKg != nil && catMakanan != nil && unitPcs != nil {
		defaultProducts := []domain.Product{
			{
				Code: "KOP-0001", Name: "Biji Kopi Arabica Gayo", Barcode: &bc1,
				Description: "Biji Kopi Arabica Premium dari Gayo 1Kg",
				Price: 150000, MinStock: 5, MaxStock: 50,
				CategoryID: catKopi.ID, UnitID: unitKg.ID,
			},
			{
				Code: "KOP-0002", Name: "Biji Kopi Robusta Lampung", Barcode: &bc2,
				Description: "Biji Kopi Robusta Grade A 1Kg",
				Price: 85000, MinStock: 10, MaxStock: 100,
				CategoryID: catKopi.ID, UnitID: unitKg.ID,
			},
			{
				Code: "SNC-0001", Name: "Croissant Butter", Barcode: &bc3,
				Description: "Pastry Croissant Butter Siap Panggang",
				Price: 15000, MinStock: 20, MaxStock: 100,
				CategoryID: catMakanan.ID, UnitID: unitPcs.ID,
			},
		}

		for _, dp := range defaultProducts {
			existing, _ := productRepo.FindByCode(dp.Code)
			if existing == nil {
				productRepo.Create(&dp)
				logger.Log.Info().Msgf("Successfully seeded product: %s", dp.Name)
			}
		}
	}

	// Seed Initial Inventory (Using straightforward DB insert for dummy data)
	owner, _ := userRepo.FindByEmail("owner@dalley.id")
	prods, _ := productRepo.FindAll()
	
	for _, p := range prods {
		var summary domain.StockSummary
		err := database.DB.Where("product_id = ?", p.ID).First(&summary).Error
		if err != nil {
			// No summary exists, create dummy stock
			dummyStock := 50
			
			// Insert Summary
			database.DB.Create(&domain.StockSummary{
				ProductID: p.ID,
				Quantity:  dummyStock,
			})
			
			// Insert Ledger
			database.DB.Create(&domain.StockLedger{
				ProductID:   p.ID,
				Type:        domain.MovementTypeIn,
				Quantity:    dummyStock,
				Notes:       "Initial Stock Seeder",
				ReferenceNo: "SEED-001",
				CreatedByID: owner.ID,
			})
			logger.Log.Info().Msgf("Seeded initial inventory for product: %s", p.Code)
		}
	}

	logger.Log.Info().Msg("Seeding process completed!")
}
