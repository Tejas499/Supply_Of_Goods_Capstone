package com.edutech.supply_of_goods_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    // Stores OTP data: username -> OtpEntry
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static final int OTP_EXPIRY_MINUTES = 5;

    public void generateAndSendOtp(String username, String email) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000)); // 6-digit OTP
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        otpStore.put(username, new OtpEntry(otp, expiry));
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your Login OTP - Supply of Goods");
        message.setText(
            "Hello " + username + ",\n\n" +
            "Your One-Time Password (OTP) for login is:\n\n" +
            "  " + otp + "\n\n" +
            "This OTP is valid for " + OTP_EXPIRY_MINUTES + " minutes.\n" +
            "Do not share this OTP with anyone.\n\n" +
            "If you did not request this, please ignore this email.\n\n" +
            "Regards,\nSupply of Goods Management System"
        );
        mailSender.send(message);
    }

    public boolean verifyOtp(String username, String otp) {
        OtpEntry entry = otpStore.get(username);
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry)) {
            otpStore.remove(username);
            return false;
        }
        if (entry.otp.equals(otp)) {
            otpStore.remove(username); // OTP is single-use
            return true;
        }
        return false;
    }

    private static class OtpEntry {
        String otp;
        LocalDateTime expiry;

        OtpEntry(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }
}
