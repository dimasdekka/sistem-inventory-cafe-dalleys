package token

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenMaker struct {
	privateKey *rsa.PrivateKey
	publicKey  *rsa.PublicKey
}

type AuthPayload struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func NewTokenMaker(privateKeyPath, publicKeyPath string) (*TokenMaker, error) {
	privBytes, err := os.ReadFile(privateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("could not read private key: %w", err)
	}
	privKey, err := jwt.ParseRSAPrivateKeyFromPEM(privBytes)
	if err != nil {
		return nil, fmt.Errorf("could not parse private key: %w", err)
	}

	pubBytes, err := os.ReadFile(publicKeyPath)
	if err != nil {
		return nil, fmt.Errorf("could not read public key: %w", err)
	}
	pubKey, err := jwt.ParseRSAPublicKeyFromPEM(pubBytes)
	if err != nil {
		return nil, fmt.Errorf("could not parse public key: %w", err)
	}

	return &TokenMaker{
		privateKey: privKey,
		publicKey:  pubKey,
	}, nil
}

func (maker *TokenMaker) CreateToken(userID, role string, duration time.Duration) (string, error) {
	payload := AuthPayload{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodRS256, payload)
	return jwtToken.SignedString(maker.privateKey)
}

func (maker *TokenMaker) VerifyToken(token string) (*AuthPayload, error) {
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodRSA)
		if !ok {
			return nil, fmt.Errorf("invalid token signing method")
		}
		return maker.publicKey, nil
	}

	jwtToken, err := jwt.ParseWithClaims(token, &AuthPayload{}, keyFunc)
	if err != nil {
		return nil, err
	}

	payload, ok := jwtToken.Claims.(*AuthPayload)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	return payload, nil
}
