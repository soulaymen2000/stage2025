package glsib.stage2025.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        String token = null;
        String username = null;
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            System.out.println("[JWT DEBUG] Token found: " + token);
            try {
                username = jwtService.getUsernameFromToken(token);
                System.out.println("[JWT DEBUG] Username from token: " + username);
            } catch (Exception e) {
                System.out.println("[JWT DEBUG] Failed to parse token: " + e.getMessage());
            }
        }
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            System.out.println("[JWT DEBUG] UserDetails loaded: " + userDetails.getUsername());
            if (jwtService.validateToken(token)) {
                System.out.println("[JWT DEBUG] Token is valid. Setting authentication.");
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.out.println("[JWT DEBUG] Token is invalid.");
            }
        }
        filterChain.doFilter(request, response);
    }
}
