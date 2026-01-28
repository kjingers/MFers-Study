# Bible Study App - Development Guide

## Project Overview

You are working on a Bible study web application for a small group that meets every Tuesday evening. Your job is to understand the codebase, improve it, and add features that will genuinely help this group.

**GitHub Repository:** https://github.com/kjingers/MFers-Bible-Study-App  
**Hosting:** Microsoft Azure Portal (account: kurtis.ingersoll@gmail.com)

**Important:** You have autonomy here. If you see a better way to implement something, a feature that isn't needed, or something I haven't thought of - go for it. I trust your judgment. Just document your reasoning.

---

## Getting Started

1. Clone the repo and explore the codebase
2. Run it locally and understand what currently exists
3. Identify what's working, what's broken, and what's missing
4. Create a development plan (GitHub issues are great for this)
5. Work through improvements via pull requests

---

## Context: How the App is Used

**The group:**
- Small group of families (maybe 8-12 people total)
- Meet every Tuesday evening for Bible study
- Studies run 10-15 weeks typically
- Not everyone is technical - the app needs to be dead simple

**Weekly routine:**
1. One family brings dinner (they rotate informally, just sign up)
2. Group does the required reading beforehand (either from a book or Bible passages)
3. During the study, someone leads discussion through a set of questions
4. Each family RSVPs so they know how much food to make

**Primary use case:** People pulling up the app on their phones during the Tuesday meeting.

---

## What the App Currently Has (Roughly)

Review the actual code to verify, but based on my understanding:

- Create and view studies
- Navigate weeks within a study
- Some attempt at showing current week
- Meal planner (partially done)
- 4-digit codes for identifying families
- Head count / attendance tracking (basic)

---

## Problems to Solve

### 1. "What week are we on?"

People open the app and need to quickly get to the current week of the current study. Right now this might not work smoothly.

**The goal:** Open app → immediately see this week's content (reading assignment + discussion questions). No hunting around.

*Current week = the week for the next upcoming Tuesday (including today if it's Tuesday)*

---

### 2. "Wait, what was the question again?"

This is the big one. During discussion, the leader reads a question, people think about it, then someone asks "can you repeat the question?" This happens 2-3 times per question, and questions are often long.

**The goal:** Everyone can see the current question highlighted on their phone in real-time as the discussion progresses.

Some considerations:
- Who can change the highlighted question? (Probably just the leader for that week)
- How does this sync work technically? (WebSockets? Firebase? Something else?)
- What happens if someone's phone loses connection?
- Does there need to be a "live mode" or does it just always work?

I don't have strong opinions on implementation - figure out what makes sense.

---

### 3. "Who's bringing food? How many people are coming?"

Families sign up to bring dinner. Everyone RSVPs with their head count so the cooking family knows how much to make.

**The goal:** 
- Easy to see who's cooking this week and what they're making
- Easy to RSVP for your family (adults + kids count)
- See total head count

Currently families have 4-digit codes. One family member should be able to RSVP for the whole family (I shouldn't need to RSVP separately from my wife).

---

### 4. General Quality

- Should work great on mobile (this is the main way people use it)
- Should look modern and clean
- Should have reasonable test coverage
- Should deploy automatically when pushing to main

---

## What I Care About

✅ Simple and intuitive - if someone needs instructions, it's too complicated  
✅ Works reliably on phones  
✅ The live question sync actually works well  
✅ Deployed and accessible  

## What I Don't Care About

❌ Specific technologies (use whatever makes sense)  
❌ Pixel-perfect designs (functional > fancy)  
❌ Features I mentioned that you think aren't actually useful  
❌ Strict adherence to my suggestions if you have better ideas  

---

## Your Autonomy

Feel free to:
- Restructure the codebase if it needs it
- Choose different technologies than what's there
- Skip features that seem unnecessary
- Add features I didn't mention if they'd help
- Simplify my overcomplicated ideas
- Push back on requirements that don't make sense

Just document your decisions so I understand what you did and why.

---

## Workflow

- Use GitHub issues to track work
- Make pull requests for changes
- Deploy to Azure when merging to main
- Test on mobile before considering something done

---

## Questions You Should Answer First

After reviewing the codebase:
1. What's the current tech stack?
2. What's actually working vs broken vs missing?
3. What's your recommended approach for the live question sync?
4. What would you prioritize?
5. Anything in my requirements that you'd do differently?

Document these findings before diving into code.

---

Good luck! Build something that makes Tuesday nights a little smoother for our group.