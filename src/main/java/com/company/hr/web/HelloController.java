package com.company.hr.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Demo")
public class HelloController {

    @GetMapping("/me")
    @Operation(summary = "Protected endpoint example (requires Bearer token)")
    public String me() {
        return "ok";
    }
}

