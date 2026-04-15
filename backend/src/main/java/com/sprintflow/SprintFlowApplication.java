package com.sprintflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.sprintflow")
public class SprintFlowApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(SprintFlowApplication.class, args);
    }
}
