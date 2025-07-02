package com.example.springboot.utils;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

/**
 * Utility class for extracting text content from PDF files.
 * <p>
 * This class leverages Apache PDFBox to parse PDF files and extract the textual content.
 * It is designed for use with {@link MultipartFile} instances typically uploaded through a web form.
 */
public class PdfToTextUtils {

    /**
     * Extracts text from the provided PDF file.
     * <p>
     * The method loads the PDF from the provided {@link MultipartFile}, uses {@link PDFTextStripper}
     * to extract the text, and then returns the trimmed text content.
     *
     * @param file the PDF file from which text will be extracted
     * @return the text content of the PDF
     * @throws IOException if an error occurs while reading the PDF or extracting text
     */
    public static String extractText(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream();
             PDDocument document = PDDocument.load(inputStream)) {

            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document).trim();
        }
    }
}
