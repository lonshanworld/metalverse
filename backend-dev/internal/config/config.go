package config

import (
	"fmt"
	"log"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Server      ServerConfig
	Database    DatabaseConfig
	JWT         JWTConfig
	Storage     StorageConfig
	CORS        CORSConfig
	Google      GoogleConfig
	Environment string
}

type ServerConfig struct {
	Port           string
	GinMode        string
	TrustedProxies []string
	FrontendURL    string
	EventPortalURL string
}

type DatabaseConfig struct {
	// URL optional full Postgres DSN (e.g. Supabase "Connection string" from dashboard).
	// When set, Host/Port/User/Password/DBName/SSLMode are ignored.
	URL      string
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	Secret      string
	ExpiryHours int
}

type StorageConfig struct {
	Provider       string
	MinioEndpoint  string
	MinioAccessKey string
	MinioSecretKey string
	MinioUseSSL    bool
	MinioBucket    string
	AWSRegion      string
	AWSAccessKey   string
	AWSSecretKey   string
	AWSBucket      string
	AWSSESSender   string
}

type CORSConfig struct {
	AllowedOrigins []string
}

type GoogleConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

func Load() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	expiryHours, err := strconv.Atoi(getEnv("JWT_EXPIRY_HOURS", "24"))
	if err != nil {
		expiryHours = 24
	}

	minioUseSSL, _ := strconv.ParseBool(getEnv("MINIO_USE_SSL", "false"))

	config := &Config{
		Server: ServerConfig{
			Port:           getEnv("SERVER_PORT", "8080"),
			GinMode:        getEnv("GIN_MODE", "debug"),
			TrustedProxies: parseCSV(getEnv("TRUSTED_PROXIES", "127.0.0.1,::1")),
			FrontendURL:    getEnv("FRONTEND_URL", "http://localhost:3000"),
			EventPortalURL: getEnv("EVENT_PORTAL_URL", getEnv("FRONTEND_URL", "http://localhost:3000/org")),
		},
		Database: DatabaseConfig{
			URL:      getEnv("DATABASE_URL", ""),
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "medalverse"),
			Password: getEnv("DB_PASSWORD", "medalverse_password"),
			DBName:   getEnv("DB_NAME", "medalverse_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			Secret:      getEnv("JWT_SECRET", "your-secret-key-change-this"),
			ExpiryHours: expiryHours,
		},
		Storage: StorageConfig{
			Provider:       getEnv("STORAGE_PROVIDER", "minio"),
			MinioEndpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
			MinioAccessKey: getEnv("MINIO_ACCESS_KEY", "minioadmin"),
			MinioSecretKey: getEnv("MINIO_SECRET_KEY", "minioadmin"),
			MinioUseSSL:    minioUseSSL,
			MinioBucket:    getEnv("MINIO_BUCKET", "medalverse"),
			AWSRegion:      getEnv("AWS_REGION", "us-east-1"),
			AWSAccessKey:   getEnv("AWS_ACCESS_KEY_ID", ""),
			AWSSecretKey:   getEnv("AWS_SECRET_ACCESS_KEY", ""),
			AWSBucket:      getEnv("AWS_BUCKET", ""),
			AWSSESSender:   getEnv("AWS_SES_SENDER", "noreply@medalverse.com"),
		},
		CORS: CORSConfig{
			AllowedOrigins: parseCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")),
		},
		Google: GoogleConfig{
			ClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
			ClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
			RedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/api/v1/auth/google/callback"),
		},
		Environment: getEnv("ENV", "development"),
	}

	return config, nil
}

// rewritePostgresURLHost swaps the host in a postgres:// or postgresql:// URL so TCP connects by IP
// (bypasses broken DNS on some networks). hostOverride may be an IPv4, IPv6, or resolvable name.
func rewritePostgresURLHost(dsn, hostOverride string) (string, error) {
	u, err := url.Parse(dsn)
	if err != nil {
		return "", err
	}
	if u.Host == "" {
		return "", fmt.Errorf("no host in DATABASE_URL")
	}
	port := u.Port()
	if port == "" {
		port = "5432"
	}
	host := strings.TrimSpace(hostOverride)
	host = strings.Trim(host, "[]")
	ip := net.ParseIP(host)
	switch {
	case ip != nil && ip.To4() == nil:
		u.Host = "[" + ip.String() + "]:" + port
	case ip != nil:
		u.Host = ip.String() + ":" + port
	case strings.Contains(host, ":") && !strings.Contains(host, "."):
		u.Host = "[" + host + "]:" + port
	default:
		u.Host = host + ":" + port
	}
	return u.String(), nil
}

func (c *Config) GetDSN() string {
	if trimmed := strings.TrimSpace(c.Database.URL); trimmed != "" {
		override := strings.TrimSpace(os.Getenv("DATABASE_HOST_OVERRIDE"))
		if override != "" {
			out, err := rewritePostgresURLHost(trimmed, override)
			if err != nil {
				log.Printf("config: DATABASE_HOST_OVERRIDE ignored: %v", err)
				return trimmed
			}
			log.Println("config: DATABASE_HOST_OVERRIDE set — connecting by IP/host override (avoids DNS for db.*.supabase.co)")
			return out
		}
		return trimmed
	}
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.DBName,
		c.Database.SSLMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseCSV(value string) []string {
	if value == "" {
		return []string{}
	}

	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}

	return result
}
