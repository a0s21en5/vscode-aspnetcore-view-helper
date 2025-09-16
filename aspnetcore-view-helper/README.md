# ASP.NET Core View Helper

A Visual Studio Code extension that helps developers easily create and manage ASP.NET Core MVC views, similar to Visual Studio's built-in functionality.

## Features

### 🎯 Right-click Controller Method → Generate View
- **Smart Detection**: Automatically detects controller and action names from your cursor position
- **Template Selection**: Choose from Empty, Index, Create, Edit, Delete, or Details templates
- **Model Integration**: Specify @model type and layout usage
- **Auto-placement**: Generates .cshtml files in the correct Views/{Controller} folder

### 🔧 CRUD View Scaffolding
- **Bulk Generation**: Create all CRUD views (Index, Create, Edit, Details, Delete) at once
- **Model-based**: Generate views based on your model type
- **Consistent Structure**: Uses standardized templates for consistent UI

### 📁 Default MVC Templates
- **Quick Setup**: Generate essential MVC files with one command:
  - `_ViewStart.cshtml`
  - `_ViewImports.cshtml` 
  - `_Layout.cshtml`
  - `Shared/Error.cshtml`
- **Project-aware**: Automatically uses your project name in templates

### ✨ Razor Snippets
Comprehensive snippets for common Razor syntax:
- `@model` - Model directive
- `@inject` - Dependency injection
- `@Html.EditorFor` - Form editors
- `foreach` - Razor loops
- `if`/`ifelse` - Conditional rendering
- `form` - Tag helper forms
- `section` - View sections
- And many more!

### 🔍 Navigation Helpers
- **Go to Model Definition**: Right-click on `@model` directive to jump to model class
- **Smart Search**: Automatically finds and opens the corresponding model file

## Usage

### Generate View from Controller
1. Open a C# controller file
2. Position cursor on or near an action method
3. Right-click and select "Generate View"
4. Choose template type and model options
5. The view will be created in `Views/{ControllerName}/{ActionName}.cshtml`

### Scaffold CRUD Views
1. Right-click on any folder in Explorer
2. Select "Scaffold CRUD Views"
3. Enter model type (e.g., `MyApp.Models.Product`)
4. Enter controller name
5. All CRUD views will be generated

### Generate Default Templates
1. Right-click on project folder in Explorer
2. Select "Generate Default MVC Templates"
3. Essential MVC files will be created in Views folder

### Using Snippets
1. Open any `.cshtml` file
2. Type snippet prefix (e.g., `@model`, `foreach`, `form`)
3. Press Tab to expand snippet
4. Navigate through placeholders with Tab

### Navigation
1. Open a `.cshtml` file with `@model` directive
2. Position cursor on model type
3. Right-click and select "Go to Model Definition"
4. Model file will open at class declaration

## Available Templates

### View Templates
- **Empty**: Basic view with optional model and layout
- **Index**: List view with table layout for displaying collections
- **Create**: Form for creating new entities
- **Edit**: Form for editing existing entities  
- **Details**: Read-only view for displaying entity details
- **Delete**: Confirmation view for delete operations

### Default Templates
- **_ViewStart.cshtml**: Sets default layout for all views
- **_ViewImports.cshtml**: Global using statements and tag helpers
- **_Layout.cshtml**: Bootstrap-based layout with navigation
- **Error.cshtml**: Error page with development/production modes

## Requirements

- Visual Studio Code 1.104.0 or higher
- ASP.NET Core project (detected by .csproj files)
- C# extension (recommended for full functionality)

## Extension Commands

- `ASP.NET Core: Generate View` - Generate single view from controller
- `ASP.NET Core: Scaffold CRUD Views` - Generate all CRUD views
- `ASP.NET Core: Generate Default MVC Templates` - Create essential MVC files
- `ASP.NET Core: Go to Model Definition` - Navigate to model class

## Configuration

The extension works out-of-the-box without configuration. It automatically:
- Detects project structure
- Creates appropriate folder hierarchy
- Uses project name in templates
- Follows ASP.NET Core conventions

## Contributing

This extension is designed to improve ASP.NET Core development productivity in VS Code. 

### Future Enhancements
- EF Core integration for automatic scaffolding
- Enhanced model property detection
- Razor diagnostics and IntelliSense
- Integration with dotnet CLI tools
- Preview in browser functionality

## License

MIT License - see LICENSE file for details.

## Release Notes

### 0.0.1
- Initial release
- Basic view generation from controllers
- CRUD scaffolding
- Default MVC templates
- Razor snippets
- Model navigation

---

**Enjoy building ASP.NET Core applications with enhanced productivity!**
