package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"caffe-dalley-backend/internal/database"
	"caffe-dalley-backend/pkg/response"
	"caffe-dalley-backend/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

var slidingWindowScript = redis.NewScript(`
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)

if count >= limit then
	return 0
end

redis.call('ZADD', key, now, now)
redis.call('EXPIRE', key, math.ceil(window / 1000))
return 1
`)

// RateLimiter uses a sliding window algorithm in Redis
func RateLimiter(limit int, window time.Duration, keyPrefix string) gin.HandlerFunc {
	return func(c *gin.Context) {
		identifier := c.ClientIP()

		// If user is authenticated, use UserID instead of IP for limiting
		payload, exists := c.Get(authorizationPayloadKey)
		if exists && payload != nil {
			if authPayload, ok := payload.(*token.AuthPayload); ok {
				identifier = authPayload.UserID
			}
		}

		key := fmt.Sprintf("rate_limit:%s:%s", keyPrefix, identifier)
		now := time.Now().UnixMilli()
		windowMs := window.Milliseconds()

		allowed, err := slidingWindowScript.Run(context.Background(), database.RedisClient, []string{key}, now, windowMs, limit).Int()
		if err != nil {
			// On Redis error, we should probably allow the request to prevent total outage,
			// or block it depending on strictness. We'll allow and log error conceptually.
			c.Next()
			return
		}

		if allowed == 0 {
			response.Error(c, http.StatusTooManyRequests, "Rate limit exceeded, please try again later.", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}
