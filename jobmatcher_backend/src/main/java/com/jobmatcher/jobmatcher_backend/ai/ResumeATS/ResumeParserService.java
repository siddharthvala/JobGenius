package com.jobmatcher.jobmatcher_backend.ai.ResumeATS;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
@Slf4j
public class ResumeParserService {

    private static final int MAX_CHARS = 3000;

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    private static final String PDF_EXTENSION = ".pdf";

    private static final String DOCX_EXTENSION = ".docx";

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    public String extractText(MultipartFile file) throws IOException {

        validateFile(file);

        final String filename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase()
                : "";

        String extractedText;

        if (filename.endsWith(PDF_EXTENSION)) {

            extractedText = extractFromPDF(file.getInputStream());

        } else if (filename.endsWith(DOCX_EXTENSION)) {

            extractedText = extractFromDOCX(file.getInputStream());

        } else {

            throw new IllegalArgumentException(
                    "Unsupported file format. Please upload PDF or DOCX only."
            );
        }

        return cleanText(extractedText);
    }

    public String extractFromPath(Path filePath, String originalFileName) throws IOException {
        byte[] bytes = Files.readAllBytes(filePath);
        String name  = originalFileName.toLowerCase();
        if (name.endsWith(PDF_EXTENSION)) {
            return cleanText(extractFromPDF(new java.io.ByteArrayInputStream(bytes)));
        } else if (name.endsWith(DOCX_EXTENSION)) {
            return cleanText(extractFromDOCX(new java.io.ByteArrayInputStream(bytes)));
        }
        throw new IllegalArgumentException("Unsupported file format.");
    }

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty.");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException(
                    "File size exceeds 5MB limit."
            );
        }

        final String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(contentType)) {

            throw new IllegalArgumentException(
                    "Invalid file type. Only PDF and DOCX files are allowed."
            );
        }
    }

    private String extractFromPDF(InputStream inputStream)
            throws IOException {

        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {

            PDFTextStripper pdfTextStripper = new PDFTextStripper();

            return pdfTextStripper.getText(document);
        }
        catch (IOException exception) {

            log.error("Error while parsing PDF resume", exception);

            throw new IllegalArgumentException(
                    "Unable to read PDF file."
            );
        }
    }

    private String extractFromDOCX(InputStream inputStream)
            throws IOException {

        try (XWPFDocument document = new XWPFDocument(inputStream)) {

            StringBuilder extractedText = new StringBuilder();

            document.getParagraphs().forEach(paragraph ->
                    extractedText
                            .append(paragraph.getText())
                            .append(" ")
            );

            return extractedText.toString();
        }
        catch (IOException exception) {

            log.error("Error while parsing DOCX resume", exception);

            throw new IllegalArgumentException(
                    "Unable to read DOCX file."
            );
        }
    }

    private String cleanText(String text) {

        String cleanedText = text
                .replaceAll("\\s+", " ")
                .trim();

        if (cleanedText.isBlank()) {

            throw new IllegalArgumentException(
                    "No readable text found in resume. " +
                            "Please upload a valid text-based resume."
            );
        }

        if (cleanedText.length() > MAX_CHARS) {

            log.info(
                    "Resume text truncated from {} to {} characters",
                    cleanedText.length(),
                    MAX_CHARS
            );

            cleanedText = cleanedText.substring(0, MAX_CHARS);
        }

        return cleanedText;
    }
}