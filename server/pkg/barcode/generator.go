package barcode

import (
	"bytes"
	"image/png"

	"github.com/boombuler/barcode"
	"github.com/boombuler/barcode/code128"
)

// GeneratePNG generates a Code128 barcode PNG for a given text.
func GeneratePNG(text string, width, height int) ([]byte, error) {
	// Create the barcode
	bc, err := code128.Encode(text)
	if err != nil {
		return nil, err
	}

	// Scale the barcode to the given dimensions
	scaledBc, err := barcode.Scale(bc, width, height)
	if err != nil {
		return nil, err
	}

	// Encode to PNG buffer
	buf := new(bytes.Buffer)
	err = png.Encode(buf, scaledBc)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
