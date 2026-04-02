package middleware

import (
	"net/http"

	"caffe-dalley-backend/pkg/response"
	"caffe-dalley-backend/pkg/token"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

func RBACMiddleware(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		payload, exists := c.Get(authorizationPayloadKey)
		if !exists {
			response.Error(c, http.StatusUnauthorized, "Unauthorized", nil)
			c.Abort()
			return
		}

		authPayload := payload.(*token.AuthPayload)
		sub := authPayload.Role
		obj := c.Request.URL.Path
		act := c.Request.Method

		// Validate using Casbin Enforcer
		allowed, err := enforcer.Enforce(sub, obj, act)
		if err != nil {
			response.Error(c, http.StatusInternalServerError, "Error occurred when authorizing", err.Error())
			c.Abort()
			return
		}

		if !allowed {
			response.Error(c, http.StatusForbidden, "Forbidden access", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}
