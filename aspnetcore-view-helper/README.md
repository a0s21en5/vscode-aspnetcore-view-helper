# ASP.NET Core View Helper

A Visual Studio Code extension that helps developers easily create and manage ASP.NET Core MVC views with intelligent model-based generation.

## ✨ Key Features

### 🎯 Smart View Generation
- **Automatic Model Property Detection**: Parses C# model files to extract actual properties, types, and attributes
- **Intelligent Input Types**: Generates appropriate HTML5 input types based on property types and data annotations
- **Primary Key Detection**: Automatically identifies and handles primary key properties
- **Right-click Integration**: Generate views directly from controller methods

### 🔧 CRUD Scaffolding
- **Complete CRUD Operations**: Generate Index, Create, Edit, Details, and Delete views at once
- **Model-based Forms**: Creates forms with proper input types and validation
- **Bootstrap Integration**: Uses Bootstrap CSS classes for responsive design

### 📁 Project Structure Aware
- **Smart Project Detection**: Automatically finds your .NET project root
- **Correct View Placement**: Creates views in the existing project's Views folder
- **Multi-level Support**: Works with both workspace-root and nested project structures

### ✂️ Razor Snippets
Comprehensive snippets for common Razor syntax: `@model`, `@foreach`, `@if`, form helpers, and more.

## � Quick Start

### Generate View from Controller
1. Open a C# controller file
2. Position cursor on an action method
3. Right-click → "Generate View"
4. Select template and model options
5. View is created with actual model properties

### Scaffold Complete CRUD
1. Right-click on project folder
2. Select "Scaffold CRUD Views"
3. Enter model type (e.g., `MyApp.Models.Product`)
4. All CRUD views are generated with proper forms and navigation

### Setup Default MVC Structure
1. Right-click on project root
2. Select "Generate Default MVC Templates"
3. Creates `_ViewStart.cshtml`, `_ViewImports.cshtml`, `_Layout.cshtml`, and `Error.cshtml`

## 🔍 Model Property Detection

The extension intelligently parses your C# models to generate accurate views:

```csharp
public class Product
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; }
    
    [EmailAddress]
    public string ContactEmail { get; set; }
    
    [Range(0.01, 9999.99)]
    public decimal Price { get; set; }
    
    public DateTime CreatedDate { get; set; }
    
    public bool IsActive { get; set; }
}
```

**Generated Create Form**:

- `Id` → Hidden field (primary key)
- `Name` → Text input with validation
- `ContactEmail` → Email input
- `Price` → Number input
- `CreatedDate` → DateTime-local input
- `IsActive` → Checkbox

## 📋 Available Commands

| Command | Description | Context |
|---------|-------------|---------|
| Generate View | Create single view from controller method | C# controller files |
| Scaffold CRUD Views | Generate all CRUD views for a model | Explorer context |
| Generate Default MVC Templates | Create essential MVC structure | Explorer context |
| Go to Model Definition | Navigate to model class from view | Razor view files |

## 🛠️ Requirements

- Visual Studio Code 1.104.0+
- ASP.NET Core project (detected by .csproj files)
- C# extension (recommended)

## 🏗️ Architecture

The extension is built with a modular architecture:

```text
src/
├── extension.ts          # Main extension entry point
├── types.ts             # TypeScript interfaces and types
├── controllerUtils.ts   # Controller and action detection
├── modelParser.ts       # C# model property parsing
├── templateGenerator.ts # View template generation
└── projectUtils.ts      # Project structure utilities
```

## 🧩 Template System

Uses Handlebars.js templates with smart model property injection:

- **Dynamic Property Lists**: Templates iterate over actual model properties
- **Type-aware Inputs**: Different input types based on C# property types
- **Attribute Recognition**: Supports data annotation attributes
- **Primary Key Handling**: Special handling for ID properties

## 📝 Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package extension
npm run package
```

## 🔧 Configuration

The extension works out-of-the-box without configuration. It automatically:

- Detects .NET project structure
- Finds existing Views folders
- Uses project naming conventions
- Follows ASP.NET Core best practices

## 📄 License

MIT License - see LICENSE file for details.

---

**Enhance your ASP.NET Core development with intelligent view generation!**
