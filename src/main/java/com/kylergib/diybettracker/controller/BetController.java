package com.kylergib.diybettracker.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller

public class BetController {

    @RequestMapping("/bets")
    public String bets() {
        return "bets";
    }
}
