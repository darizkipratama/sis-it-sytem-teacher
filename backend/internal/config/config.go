package config

import (
	"fmt"
	"os"
	"time"
)

type Config struct {
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBSSLMode      string
	JWTSecret      string
	JWTExpiration  time.Duration
}

func Load() *Config {
	return &Config{
		DBHost:         getEnv("DB_HOST", "localhost"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         getEnv("DB_USER", "postgres"),
		DBPassword:     getEnv("DB_PASSWORD", "postgres"),
		DBName:         getEnv("DB_NAME", "guru_backend"),
		DBSSLMode:      getEnv("DB_SSLMODE", "disable"),
		JWTSecret:      getEnv("JWT_SECRET", "super_secret_jwt_key_change_in_production"),
		JWTExpiration:  time.Duration(mustParseInt(getEnv("JWT_EXPIRATION_HOURS", "24"))) * time.Hour,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func mustParseInt(s string) int {
	var n int
	_, _ = fmt.Sscanf(s, "%d", &n)
	if n == 0 {
		n = 24
	}
	return n
}