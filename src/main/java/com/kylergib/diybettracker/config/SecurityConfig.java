package com.kylergib.diybettracker.config;

import com.kylergib.diybettracker.entity.MyUser;
import com.kylergib.diybettracker.service.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.RequestAttributeSecurityContextRepository;

import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private MyUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(withDefaults())
                .authorizeHttpRequests(authorize -> authorize
                                .requestMatchers(antMatcher("/built/**"),antMatcher("/main.css")).permitAll()
                        .requestMatchers(antMatcher("/api/current_user")).authenticated()
                        .anyRequest().authenticated()
                )
//                .csrf((csrf) -> csrf.disable()) //todo fix eventually
                .formLogin(withDefaults())
                .httpBasic(withDefaults())
                .logout(withDefaults())

                //testing persistence
                .securityContext((securityContext) -> securityContext
                        .requireExplicitSave(true)
                );



        return http.build();
    }

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(this.userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(MyUser.PASSWORD_ENCODER);
        auth.authenticationProvider(daoAuthenticationProvider);
    }

}
