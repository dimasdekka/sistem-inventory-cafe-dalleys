package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"caffe-dalley-backend/internal/database"
	"caffe-dalley-backend/pkg/response"
	"caffe-dalley-backend/pkg/token"

	"github.com/gin-gonic/gin"
)

const (
	authorizationHeaderKey  = "Authorization"
	authorizationTypeBearer = "Bearer"
	authorizationPayloadKey = "authorization_payload"
)

func AuthMiddleware(tokenMaker *token.TokenMaker) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader(authorizationHeaderKey)
		if len(authHeader) == 0 {
			response.Error(c, http.StatusUnauthorized, "authorization header is not provided", nil)
			c.Abort()
			return
		}

		fields := strings.Fields(authHeader)
		if len(fields) < 2 {
			response.Error(c, http.StatusUnauthorized, "invalid authorization header format", nil)
			c.Abort()
			return
		}

		authType := fields[0]
		if !strings.EqualFold(authType, authorizationTypeBearer) {
			response.Error(c, http.StatusUnauthorized, fmt.Sprintf("unsupported authorization type %s", authType), nil)
			c.Abort()
			return
		}

		accessToken := fields[1]
		payload, err := tokenMaker.VerifyToken(accessToken)
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "invalid or expired token", err.Error())
			c.Abort()
			return
		}

		// Check Blacklist in Redis (if logged out early)
		// Assuming token ID (jti) is stored as key in redis if blacklisted. Since we use random JTI or just check if it's blacklisted
		// Actually, in the PRD: Blacklist Redis SET blacklist:jti:{jti} EX {ttl}
		// Since we didn't add JTI to claims in jwt.go explicitly, we can use the token signature itself or the token string for blacklist in this sprint,
		// or update JWT to have an ID.
		isBlacklisted, err := database.RedisClient.Exists(context.Background(), "blacklist:token:"+accessToken).Result()
		if err == nil && isBlacklisted > 0 {
			response.Error(c, http.StatusUnauthorized, "token is revoked", nil)
			c.Abort()
			return
		}

		c.Set(authorizationPayloadKey, payload)
		c.Next()
	}
}
