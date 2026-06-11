package com.jobmatcher.jobmatcher_backend.ai.ResumeATS;

import org.springframework.web.multipart.MultipartFile;

import java.io.*;

public class SimpleMultipartFile implements MultipartFile {

    private final String name;
    private final byte[] content;

    public SimpleMultipartFile(String name, byte[] content) {
        this.name    = name;
        this.content = content != null ? content : new byte[0];
    }

    @Override
    public String getName() { return name; }

    @Override
    public String getOriginalFilename() { return name; }

    @Override
    public String getContentType() {
        if (name != null) {
            String lower = name.toLowerCase();
            if (lower.endsWith(".pdf"))  return "application/pdf";
            if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
        return "application/octet-stream";
    }

    @Override
    public boolean isEmpty() { return content.length == 0; }

    @Override
    public long getSize() { return content.length; }

    @Override
    public byte[] getBytes() { return content; }

    @Override
    public InputStream getInputStream() { return new ByteArrayInputStream(content); }

    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
        try (FileOutputStream fos = new FileOutputStream(dest)) {
            fos.write(content);
        }
    }
}