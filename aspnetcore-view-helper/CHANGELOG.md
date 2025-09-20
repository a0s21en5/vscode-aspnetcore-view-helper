# Change Log

All notable changes to the "aspnetcore-view-helper" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.0] - 2025-09-18

### Added

- **Smart Model Property Detection**: Extension now automatically parses C# model files to extract actual properties with their types and attributes
- **Intelligent Input Type Generation**: Form inputs are generated with appropriate HTML5 input types based on property types (datetime-local, number, email, url, etc.)
- **Primary Key Detection**: Automatically identifies primary key properties using conventions (Id, *Id) and [Key] attributes
- **Attribute-Based Validation**: Recognizes data annotation attributes like [Required], [EmailAddress], [Url] for better form generation
- **Enhanced Project Root Detection**: Views are now created in the correct project location, supporting both root-level and nested project structures

### Changed

- **Template System Overhaul**: All view templates now use actual model properties instead of placeholder values
- **Improved Property Parsing**: More robust C# code parsing with support for attributes, nullable types, and various property declarations
- **Better Type Recognition**: Enhanced detection of property types including System types, nullable types, and generic collections

### Fixed

- **View Placement**: Views are now created inside the existing project's Views folder instead of creating a new one outside the application
- **Template Data Accuracy**: Generated views now reflect the actual model structure with correct property names and types

## [0.0.1] - Initial Release

### Features

- Basic view generation from controllers
- CRUD scaffolding
- Default MVC templates
- Razor snippets
- Model navigation