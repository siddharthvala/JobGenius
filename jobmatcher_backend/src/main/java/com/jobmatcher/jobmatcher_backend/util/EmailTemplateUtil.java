package com.jobmatcher.jobmatcher_backend.util;

public class EmailTemplateUtil {

    private EmailTemplateUtil() {}

    // ── Shared wrapper ────────────────────────────────────────────────────────

    private static String wrap(String accentColor, String badgeText, String bodyContent, String footerNote) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
              <title>JobGenius</title>
            </head>
            <body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 16px;">
                <tr><td align="center">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="max-width:580px;">

                    <!-- Header -->
                    <tr><td style="background:#2563EB;border-radius:16px 16px 0 0;padding:28px 32px;">
                      <table width="100%%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Job<span style="color:#93C5FD;">Genius</span></span>
                          </td>
                          <td align="right">
                            <span style="background:%s;color:#fff;font-size:11px;font-weight:700;padding:5px 14px;border-radius:50px;letter-spacing:0.5px;text-transform:uppercase;">%s</span>
                          </td>
                        </tr>
                      </table>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="background:#fff;padding:36px 32px;">
                      %s
                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background:#F1F5F9;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#94A3B8;">%s</p>
                      <p style="margin:8px 0 0;font-size:12px;color:#CBD5E1;">© 2025 JobGenius. All rights reserved.</p>
                    </td></tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(accentColor, badgeText, bodyContent, footerNote);
    }

    // ── Reusable inner blocks ─────────────────────────────────────────────────

    private static String infoRow(String label, String value) {
        return """
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#64748B;font-weight:600;width:40%%;border-bottom:1px solid #F1F5F9;">%s</td>
              <td style="padding:10px 16px;font-size:13px;color:#1E293B;font-weight:700;border-bottom:1px solid #F1F5F9;">%s</td>
            </tr>
            """.formatted(label, value);
    }

    private static String ctaButton(String url, String label, String color) {
        return """
            <div style="text-align:center;margin-top:28px;">
              <a href="%s" style="background:%s;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 32px;border-radius:10px;display:inline-block;letter-spacing:0.2px;">%s</a>
            </div>
            """.formatted(url, color, label);
    }

    private static String greeting(String name) {
        return "<h2 style=\"margin:0 0 8px;font-size:22px;font-weight:900;color:#1E293B;\">Hi %s 👋</h2>".formatted(name);
    }

    private static String subText(String text) {
        return "<p style=\"margin:0 0 24px;font-size:15px;color:#64748B;line-height:1.6;\">%s</p>".formatted(text);
    }

    private static String statusBadge(String label, String bg, String color) {
        return "<div style=\"display:inline-block;background:%s;color:%s;font-size:12px;font-weight:700;padding:6px 18px;border-radius:50px;margin-bottom:20px;letter-spacing:0.5px;\">%s</div>"
                .formatted(bg, color, label);
    }

    // ── 1. Welcome ────────────────────────────────────────────────────────────

    public static String buildWelcomeEmail(String candidateName, String frontendUrl) {
        String body = greeting(candidateName) +
                subText("Welcome to <strong>JobGenius</strong>! Your account is ready. Start exploring jobs, tracking your skill gap, and applying with your AI-scored resume.") +
                "<div style=\"background:#F0F9FF;border:1px solid #BAE6FD;border-radius:12px;padding:20px 24px;margin:20px 0;\">" +
                "<p style=\"margin:0;font-size:14px;font-weight:700;color:#0369A1;\">🚀 What you can do:</p>" +
                "<ul style=\"margin:10px 0 0;padding-left:18px;font-size:13px;color:#0C4A6E;line-height:2;\">" +
                "<li>Browse & apply to jobs matched to your skills</li>" +
                "<li>Analyse your skill gap for any role</li>" +
                "<li>Upload your resume for AI-powered ATS scoring</li>" +
                "<li>Get personalised career insights</li>" +
                "</ul></div>" +
                ctaButton(frontendUrl + "/find-jobs", "Explore Jobs →", "#2563EB");

        return wrap("#2563EB", "Welcome", body, "You're receiving this because you registered on JobGenius.");
    }

    // ── 2. Application Confirmation ───────────────────────────────────────────

    public static String buildApplicationConfirmationEmail(
            String candidateName, String jobTitle, String companyName,
            String appliedDate, String frontendUrl) {

        String infoTable = "<table width=\"100%%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;margin:20px 0;\">"
                + infoRow("Position", jobTitle)
                + infoRow("Company", companyName)
                + infoRow("Applied On", appliedDate)
                + infoRow("Status", "Under Review")
                + "</table>";

        String body = greeting(candidateName) +
                subText("Your application has been submitted successfully. The recruiter will review your profile and update the status shortly.") +
                infoTable +
                "<div style=\"background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px 20px;\">" +
                "<p style=\"margin:0;font-size:13px;color:#166534;\">💡 <strong>Tip:</strong> While you wait, analyse your skill gap for this role and improve your match score.</p>" +
                "</div>" +
                ctaButton(frontendUrl + "/my-applications", "View My Applications →", "#2563EB");

        return wrap("#16A34A", "Applied ✓", body, "You're receiving this because you applied for a job on JobGenius.");
    }

    // ── 3. Screening ──────────────────────────────────────────────────────────

    public static String buildScreeningEmail(String candidateName, String jobTitle, String companyName, String frontendUrl) {
        String body = greeting(candidateName) +
                statusBadge("SCREENING", "#FFF7ED", "#C2410C") +
                subText("Great news! Your profile has been <strong>shortlisted for screening</strong> for the <strong>" + jobTitle + "</strong> role at <strong>" + companyName + "</strong>.") +
                "<div style=\"background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:20px 24px;margin:20px 0;\">" +
                "<p style=\"margin:0;font-size:14px;font-weight:700;color:#C2410C;\">📋 What happens next:</p>" +
                "<p style=\"margin:10px 0 0;font-size:13px;color:#7C3A0C;line-height:1.7;\">The recruiter will reach out to schedule a screening call. Keep your profile and resume updated for best results.</p>" +
                "</div>" +
                ctaButton(frontendUrl + "/my-applications", "View Application →", "#EA580C");

        return wrap("#EA580C", "Shortlisted", body, "Status update for your job application on JobGenius.");
    }

    // ── 4. Interview ──────────────────────────────────────────────────────────

    public static String buildInterviewEmail(String candidateName, String jobTitle, String companyName, String frontendUrl) {
        String body = greeting(candidateName) +
                statusBadge("INTERVIEW", "#F0FDF4", "#15803D") +
                subText("Congratulations! You have been <strong>selected for the interview round</strong> for the <strong>" + jobTitle + "</strong> position at <strong>" + companyName + "</strong>.") +
                "<div style=\"background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px 24px;margin:20px 0;\">" +
                "<p style=\"margin:0;font-size:14px;font-weight:700;color:#15803D;\">🎯 Interview Tips:</p>" +
                "<ul style=\"margin:10px 0 0;padding-left:18px;font-size:13px;color:#14532D;line-height:2;\">" +
                "<li>Review the job requirements and required skills</li>" +
                "<li>Use the JobGenius skill gap tool to prepare</li>" +
                "<li>Research the company and role thoroughly</li>" +
                "</ul></div>" +
                ctaButton(frontendUrl + "/my-applications", "View Application →", "#16A34A");

        return wrap("#16A34A", "Interview 🎉", body, "Status update for your job application on JobGenius.");
    }

    // ── 5. Accepted / Offer ───────────────────────────────────────────────────

    public static String buildAcceptedEmail(String candidateName, String jobTitle, String companyName, String frontendUrl) {
        String body = greeting(candidateName) +
                statusBadge("OFFER RECEIVED", "#F0FDF4", "#166534") +
                "<h3 style=\"margin:0 0 12px;font-size:20px;font-weight:900;color:#166534;\">🎊 Congratulations!</h3>" +
                subText("You have received an <strong>offer</strong> for the <strong>" + jobTitle + "</strong> position at <strong>" + companyName + "</strong>. This is a fantastic achievement — well done!") +
                "<div style=\"background:linear-gradient(135deg,#F0FDF4,#DCFCE7);border:1px solid #86EFAC;border-radius:12px;padding:24px;text-align:center;margin:20px 0;\">" +
                "<p style=\"margin:0;font-size:28px;\">🏆</p>" +
                "<p style=\"margin:8px 0 0;font-size:15px;font-weight:700;color:#166534;\">You got the offer!</p>" +
                "<p style=\"margin:6px 0 0;font-size:13px;color:#14532D;\">" + companyName + " · " + jobTitle + "</p>" +
                "</div>" +
                ctaButton(frontendUrl + "/my-applications", "View Offer Details →", "#16A34A");

        return wrap("#16A34A", "Offer 🏆", body, "Status update for your job application on JobGenius.");
    }

    // ── 6. Rejected ───────────────────────────────────────────────────────────

    public static String buildRejectedEmail(String candidateName, String jobTitle, String companyName, String frontendUrl) {
        String body = greeting(candidateName) +
                statusBadge("NOT SELECTED", "#FFF1F2", "#BE123C") +
                subText("Thank you for applying to <strong>" + jobTitle + "</strong> at <strong>" + companyName + "</strong>. After careful consideration, the team has decided to move forward with other candidates at this time.") +
                "<div style=\"background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px 24px;margin:20px 0;\">" +
                "<p style=\"margin:0;font-size:14px;font-weight:700;color:#334155;\">Keep going — here's what to do next:</p>" +
                "<ul style=\"margin:10px 0 0;padding-left:18px;font-size:13px;color:#475569;line-height:2;\">" +
                "<li>Use the skill gap tool to identify areas for improvement</li>" +
                "<li>Update your resume and get a higher ATS score</li>" +
                "<li>Apply to other matching roles on JobGenius</li>" +
                "</ul></div>" +
                ctaButton(frontendUrl + "/find-jobs", "Explore More Jobs →", "#2563EB");

        return wrap("#64748B", "Update", body, "Status update for your job application on JobGenius.");
    }

    // ── 7. Forgot Password ────────────────────────────────────────────────────

    public static String buildForgotPasswordEmail(String userName, String resetLink) {
        String body = greeting(userName) +
                subText("We received a request to reset your <strong>JobGenius</strong> account password. Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.") +
                ctaButton(resetLink, "Reset My Password →", "#2563EB") +
                "<p style=\"margin:24px 0 0;font-size:13px;color:#94A3B8;text-align:center;\">If you didn't request this, you can safely ignore this email.</p>";

        return wrap("#2563EB", "Password Reset", body, "You're receiving this because a password reset was requested for your account.");
    }
}