package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	Port               string `mapstructure:"PORT"`
	Env                string `mapstructure:"ENV"`
	DBHost             string `mapstructure:"DB_HOST"`
	DBUser             string `mapstructure:"DB_USER"`
	DBPassword         string `mapstructure:"DB_PASSWORD"`
	DBName             string `mapstructure:"DB_NAME"`
	DBPort             string `mapstructure:"DB_PORT"`
	DBSSLMode          string `mapstructure:"DB_SSLMODE"`
	RedisHost          string `mapstructure:"REDIS_HOST"`
	RedisPort          string `mapstructure:"REDIS_PORT"`
	RedisPassword      string `mapstructure:"REDIS_PASSWORD"`

	// MinIO
	MinioEndpoint       string `mapstructure:"MINIO_ENDPOINT"`
	MinioAccessKey      string `mapstructure:"MINIO_ACCESS_KEY"`
	MinioSecretKey      string `mapstructure:"MINIO_SECRET_KEY"`
	MinioUseSSL         bool   `mapstructure:"MINIO_USE_SSL"`
	MinioBucketProducts string `mapstructure:"MINIO_BUCKET_PRODUCTS"`

	// JWT
	RedisDB            int    `mapstructure:"REDIS_DB"`
	RSAPrivateKeyPath  string `mapstructure:"RSA_PRIVATE_KEY_PATH"`
	RSAPublicKeyPath   string `mapstructure:"RSA_PUBLIC_KEY_PATH"`
}

func LoadConfig(path string) (*Config, error) {
	viper.SetConfigFile(path)
	viper.AutomaticEnv()

	viper.SetDefault("REDIS_DB", 0)

	// MinIO Defaults
	viper.SetDefault("MINIO_ENDPOINT", "localhost:9000")
	viper.SetDefault("MINIO_ACCESS_KEY", "minioadmin")
	viper.SetDefault("MINIO_SECRET_KEY", "minioadmin")
	viper.SetDefault("MINIO_USE_SSL", false)
	viper.SetDefault("MINIO_BUCKET_PRODUCTS", "caffe-dalley-products")

	viper.SetDefault("JWT_SECRET_KEY_PATH", "certs/private.pem")
	err := viper.ReadInConfig()
	if err != nil {
		log.Printf("Cannot read config file %s, relying on environment variables: %v", path, err)
	}

	var config Config
	err = viper.Unmarshal(&config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}
