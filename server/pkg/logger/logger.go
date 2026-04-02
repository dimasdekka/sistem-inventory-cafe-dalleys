package logger

import (
	"os"

	"github.com/rs/zerolog"
)

var Log zerolog.Logger

func InitLogger(env string) {
	if env == "development" {
		Log = zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: zerolog.TimeFormatUnix}).
			Level(zerolog.DebugLevel).
			With().
			Timestamp().
			Caller().
			Logger()
	} else {
		Log = zerolog.New(os.Stdout).
			Level(zerolog.InfoLevel).
			With().
			Timestamp().
			Logger()
	}
}
