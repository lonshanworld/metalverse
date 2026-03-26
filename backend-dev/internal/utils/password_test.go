package utils

import (
	"testing"
)

func TestHashPassword_Success(t *testing.T) {
	hash, err := HashPassword("mypassword123")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hash == "" {
		t.Error("hash should not be empty")
	}
	if hash == "mypassword123" {
		t.Error("hash should not equal the plain password")
	}
}

func TestHashPassword_DifferentPasswords(t *testing.T) {
	h1, _ := HashPassword("password1")
	h2, _ := HashPassword("password2")
	if h1 == h2 {
		t.Error("different passwords should produce different hashes")
	}
}

func TestHashPassword_SamePasswordDifferentHashes(t *testing.T) {
	h1, _ := HashPassword("same")
	h2, _ := HashPassword("same")
	if h1 == h2 {
		t.Error("bcrypt should produce different hashes for the same password (different salt)")
	}
}

func TestCheckPasswordHash_Correct(t *testing.T) {
	password := "correct-password"
	hash, _ := HashPassword(password)

	if !CheckPasswordHash(password, hash) {
		t.Error("should return true for correct password")
	}
}

func TestCheckPasswordHash_Incorrect(t *testing.T) {
	hash, _ := HashPassword("correct")

	if CheckPasswordHash("wrong", hash) {
		t.Error("should return false for wrong password")
	}
}

func TestCheckPasswordHash_EmptyPassword(t *testing.T) {
	hash, _ := HashPassword("something")

	if CheckPasswordHash("", hash) {
		t.Error("should return false for empty password")
	}
}

func TestCheckPasswordHash_InvalidHash(t *testing.T) {
	if CheckPasswordHash("password", "not-a-valid-hash") {
		t.Error("should return false for invalid hash")
	}
}
