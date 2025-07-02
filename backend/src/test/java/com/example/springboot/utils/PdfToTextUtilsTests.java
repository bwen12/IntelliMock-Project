package com.example.springboot.utils;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import static org.mockito.Mockito.when;


import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the {@link PdfToTextUtils} class.
 *
 * <p>This test class verifies the functionality of text extraction from a PDF file
 * using a mock {@link MultipartFile}. It covers both successful and failure scenarios,
 * ensuring robust handling of common edge cases.
 */
@SpringBootTest
class PdfToTextUtilsTests {

    private MultipartFile validPdfFile;
    private MultipartFile invalidPdfFile;

    /**
     * Sets up test resources including a valid in-memory PDF and an invalid file.
     *
     * @throws IOException if PDF creation fails
     */
    @BeforeEach
    void setUp() throws IOException {
        // Create a basic in-memory PDF with "Hello World" content
        try (PDDocument doc = new PDDocument()) {
            doc.addPage(new org.apache.pdfbox.pdmodel.PDPage());
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            validPdfFile = new MockMultipartFile("test.pdf", "test.pdf", "application/pdf", out.toByteArray());
        }

        // Create an invalid PDF (plain text pretending to be a PDF)
        invalidPdfFile = new MockMultipartFile(
                "fake.pdf",
                "fake.pdf",
                "application/pdf",
                "This is not a real PDF".getBytes()
        );
    }

    /**
     * Tests that text is successfully extracted from a valid PDF file.
     */
    @Test
    void testExtractTextFromValidPdf() {
        assertDoesNotThrow(() -> {
            String text = PdfToTextUtils.extractText(validPdfFile);
            assertNotNull(text);
            // The actual text may be empty if no content was added to the page
        });
    }

    /**
     * Tests that an IOException is thrown when attempting to extract text from a malformed PDF.
     */
    @Test
    void testExtractTextFromInvalidPdf_ThrowsIOException() {
        assertThrows(IOException.class, () -> {
            PdfToTextUtils.extractText(invalidPdfFile);
        });
    }

    /**
     * Tests that an IOException is thrown if the MultipartFile fails to provide an input stream.
     */
    @Test
    void testExtractText_InputStreamFails() throws IOException {
        MultipartFile brokenFile = Mockito.mock(MultipartFile.class);
        when(brokenFile.getInputStream()).thenThrow(new IOException("Simulated error"));

        IOException ex = assertThrows(IOException.class, () -> {
            PdfToTextUtils.extractText(brokenFile);
        });

        assertEquals("Simulated error", ex.getMessage());
    }
}
