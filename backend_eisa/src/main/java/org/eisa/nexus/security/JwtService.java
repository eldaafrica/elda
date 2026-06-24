package org.eisa.nexus.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class JwtService {

    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    private final SecretKey key;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs) {
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateAccessToken(String email, List<String> roles) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claims(Map.of("roles", roles, "type", TYPE_ACCESS))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessExpirationMs))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(String email) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claims(Map.of("type", TYPE_REFRESH))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshExpirationMs))
                .signWith(key)
                .compact();
    }

    /** Backwards-compatible alias. */
    public String generateToken(String email, List<String> roles) {
        return generateAccessToken(email, roles);
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public String getEmail(String token) {
        return parse(token).getSubject();
    }

    public String getType(String token) {
        Object t = parse(token).get("type");
        return t == null ? TYPE_ACCESS : t.toString();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception e) {
            log.debug("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }

    public boolean isAccessToken(String token) {
        return isValid(token) && TYPE_ACCESS.equals(getType(token));
    }

    public boolean isRefreshToken(String token) {
        return isValid(token) && TYPE_REFRESH.equals(getType(token));
    }

    public long getAccessExpirationMs() { return accessExpirationMs; }
    public long getRefreshExpirationMs() { return refreshExpirationMs; }
}
