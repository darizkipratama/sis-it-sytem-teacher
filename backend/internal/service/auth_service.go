package service

import (
	"fmt"
	"time"

	"github.com/ihsancloud/aplikasi-guru-backend/internal/config"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/domain"
	"github.com/ihsancloud/aplikasi-guru-backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	userRepo *repository.PostgresUserRepository
	cfg      *config.Config
}

func NewAuthService(userRepo *repository.PostgresUserRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: userRepo, cfg: cfg}
}

type LoginResponse struct {
	Token string               `json:"token"`
	User  *domain.User          `json:"user"`
}

func (s *AuthService) Login(nipOrEmail, password string) (*LoginResponse, error) {
	user, err := s.userRepo.FindByNIPOrEmail(nipOrEmail)
	if err != nil {
		return nil, fmt.Errorf("database error: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	token, err := s.generateJWT(user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &LoginResponse{Token: token, User: user}, nil
}

func (s *AuthService) generateJWT(user *domain.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":   user.ID,
		"nip":   user.NIP,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(s.cfg.JWTExpiration).Unix(),
		"iat":   time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}