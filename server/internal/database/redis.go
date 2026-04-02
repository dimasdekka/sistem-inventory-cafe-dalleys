package database

import (
	"context"
	"fmt"

	"caffe-dalley-backend/internal/config"
	"caffe-dalley-backend/pkg/logger"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis(cfg *config.Config) error {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	// Test Connection
	ctx := context.Background()
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return err
	}

	RedisClient = rdb
	logger.Log.Info().Msg("Successfully connected to Redis")
	return nil
}
