# Institute Gate Pass System
>Contributors: Aarya Bhave, Ayush Sadavarte, Jalaja Utekar
 
An automated security solution designed to replace manual visitor logs with a digital, QR-code-based verification system.

## Overview
The Campus Digital Gate Pass System streamlines the entry and exit process for visitors and event attendees. By automating identity verification, the system reduces security lapses, eliminates manual paper records, and assists security personnel in managing high-traffic periods such as inter-college events.
### Key Objectives
Pre-registration: Enable visitors to register before arrival.<br>
Digital Passes: Generate time-bound, QR-code-based digital gate passes.<br>
Digital Verification: Allow security staff to scan and verify passes instantly at the gate.<br>
Audit & Safety: Maintain centralized digital logs of all visitor movements.<br>

## Features
### Visitor Management
Self-Registration: Visitors fill out a digital form with their name, contact, photo, and purpose of visit.<br>
Admin Approval: Faculty or staff can admit visitors digitally.<br>
QR Delivery: Once approved, a unique QR code is generated and sent via email.<br>
### Admin & Security Tools
Management Dashboard: Admins can review, approve, or reject pending requests.<br>
Real-time Scanning: Security guards use a device camera to scan QR codes, receiving instant "VALID" or "INVALID" feedback within 2 seconds.<br>
Bulk Registration: Organizers can upload CSV files to register multiple attendees for large events.<br>
Automated Logging: The system flags visitors who have not exited after their approved time.<br>

## Technical Stack
Frontend - React.js with Bootstrap <br>
Backend - Node.js (v18 LTS+) <br>
Database - MySQL (Relational) <br>
Communication - RESTful HTTP APIs with JSON <br>
Security - HTTPS, JWT<br>

## Environment Requirements
Server: Linux-based server with Node.js v18+.<br>
Hardware:<br>
    Admin: Windows 10 or later.<br>
    Security/Users: Modern smartphone (Android 13+ / iOS 18+) with internet access.<br>
Browser: Any modern browser (Chrome, Firefox, Safari)<br>

## Security & Quality Attributes
Uptime: Target 99% availability during college hours (7AM – 7PM).<br>
Data Integrity: QR codes include server-side signed tokens to prevent forgery.<br>
Privacy: Visitor logs are read-only and restricted to Admin personnel.<br>
Fallback: In case of system outage, security personnel may revert to manual verification of ID cards.<br>
