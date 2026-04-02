package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
)

func main() {
	err := os.MkdirAll("certs", 0755)
	if err != nil {
		fmt.Println("Error creating certs dev directory:", err)
		return
	}

	privKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		fmt.Println("Error generating private key:", err)
		return
	}

	privBytes := x509.MarshalPKCS1PrivateKey(privKey)
	privPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privBytes,
	})
	if err := os.WriteFile("certs/private.pem", privPEM, 0600); err != nil {
		fmt.Println("Error writing private.pem:", err)
		return
	}

	pubBytes, err := x509.MarshalPKIXPublicKey(&privKey.PublicKey)
	if err != nil {
		fmt.Println("Error generating public key:", err)
		return
	}
	pubPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: pubBytes,
	})
	if err := os.WriteFile("certs/public.pem", pubPEM, 0644); err != nil {
		fmt.Println("Error writing public.pem:", err)
		return
	}

	fmt.Println("Keys generated successfully in certs/")
}
