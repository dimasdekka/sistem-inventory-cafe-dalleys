package upload

import (
	"context"
	"fmt"
	"mime/multipart"

	"caffe-dalley-backend/internal/config"
	"caffe-dalley-backend/pkg/logger"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client

func InitMinio(cfg *config.Config) error {
	var err error
	MinioClient, err = minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: cfg.MinioUseSSL,
	})
	if err != nil {
		return err
	}

	logger.Log.Info().Msgf("Successfully connected to MinIO at %s", cfg.MinioEndpoint)

	// Make sure the bucket exists
	ctx := context.Background()
	bucketName := cfg.MinioBucketProducts
	
	exists, errBucketExists := MinioClient.BucketExists(ctx, bucketName)
	if errBucketExists == nil && exists {
		logger.Log.Info().Msgf("MinIO bucket '%s' already exists", bucketName)
	} else {
		err = MinioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("failed creating bucket '%s': %w", bucketName, err)
		}
		
		policy := fmt.Sprintf(`{"Version": "2012-10-17","Statement": [{"Action": ["s3:GetObject"],"Effect": "Allow","Principal": {"AWS": ["*"]},"Resource": ["arn:aws:s3:::%s/*"],"Sid": ""}]}`, bucketName)
		err = MinioClient.SetBucketPolicy(ctx, bucketName, policy)
		if err != nil {
			logger.Log.Warn().Err(err).Msg("Failed to set public read policy on bucket, images might not be accessible directly.")
		}
		
		logger.Log.Info().Msgf("Successfully created new MinIO bucket '%s'", bucketName)
	}

	return nil
}

// UploadProductImage streams the multipart uploaded file to Minio and returns the URL.
// Generates a URL assuming Minio is exposed publicly. (For local dev it expects localhost:9000).
func UploadProductImage(ctx context.Context, cfg *config.Config, fileHeader *multipart.FileHeader, objectName string) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	contentType := fileHeader.Header.Get("Content-Type")

	info, err := MinioClient.PutObject(ctx, cfg.MinioBucketProducts, objectName, file, fileHeader.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", err
	}

	protocol := "http"
	if cfg.MinioUseSSL {
		protocol = "https"
	}

	url := fmt.Sprintf("%s://%s/%s/%s", protocol, cfg.MinioEndpoint, cfg.MinioBucketProducts, info.Key)
	return url, nil
}
