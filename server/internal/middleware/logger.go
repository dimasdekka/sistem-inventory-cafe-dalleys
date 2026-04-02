package middleware

import (
	"time"

	"caffe-dalley-backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

func LoggerInterceptor() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)

		logger.Log.Info().
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Int("status", c.Writer.Status()).
			Str("ip", c.ClientIP()).
			Dur("duration", duration).
			Msg("Request processed")
	}
}
