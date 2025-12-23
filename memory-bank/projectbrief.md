# Project Brief: MFers Bible Study App

## Overview
A mobile-first Progressive Web App (PWA) for the "MFers Bible Study" group that provides weekly Bible study content including readings, dinner plans, and discussion questions.

## Core Requirements
1. **Weekly Content Display**
   - Show current week's Bible reading passages
   - Display dinner host and meal information
   - Present discussion questions for the group

2. **Bible Verse Integration**
   - Clickable verse references that open a modal with the verse text
   - Support for multiple Bible translations (NIV, KJV, MSG, ESV)
   - Verse text fetched via Azure Functions API

3. **Mobile-First Design**
   - Responsive layout optimized for mobile devices
   - PWA capabilities for offline access
   - Touch-friendly navigation

4. **Azure Static Web Apps Deployment**
   - Frontend: React/Vite app deployed to Azure SWA
   - Backend: Azure Functions for Bible verse API
   - CI/CD via GitHub Actions

## Goals
- Provide an easy-to-use interface for weekly Bible study content
- Enable quick access to referenced Bible verses
- Support the fellowship aspect with dinner planning integration
- Ensure reliable deployment and hosting on Azure

## Success Metrics
- App loads quickly on mobile devices
- Bible verses display correctly across translations
- Automatic deployments work reliably via GitHub Actions
- PWA can be installed on mobile devices
