# ASP.NET Core View Helper - Development Guide

## Project Structure

```
aspnetcore-view-helper/
├── src/
│   ├── extension.ts          # Main extension logic
│   └── test/
│       └── extension.test.ts # Unit tests
├── templates/                # Handlebars templates
│   ├── empty.hbs            # Empty view template
│   ├── index.hbs            # List view template
│   ├── create.hbs           # Create form template
│   ├── edit.hbs             # Edit form template
│   ├── details.hbs          # Details view template
│   ├── delete.hbs           # Delete confirmation template
│   ├── _ViewStart.cshtml    # View start template
│   ├── _ViewImports.hbs     # View imports template
│   ├── _Layout.hbs          # Layout template
│   └── Error.cshtml         # Error page template
├── snippets/
│   └── razor.json           # Razor code snippets
├── demo/
│   └── ProductController.cs # Demo controller for testing
├── package.json             # Extension manifest
└── README.md               # Documentation
```

## Features Implemented

### ✅ Core Features
- [x] Right-click context menu for controller methods
- [x] View generation with template selection
- [x] CRUD scaffolding for complete model operations
- [x] Default MVC template generation
- [x] Comprehensive Razor snippets
- [x] Go to model definition navigation
- [x] Handlebars template system
- [x] Automatic folder structure creation
- [x] Project name detection and usage

### 📝 Template System
The extension uses Handlebars.js for template processing:

**View Templates** (`templates/*.hbs`):
- Support model type interpolation
- Layout page configuration
- Property-based form generation
- Bootstrap CSS classes
- ASP.NET Core tag helpers

**Default Templates**:
- Static templates for essential MVC files
- Project name replacement
- Standard ASP.NET Core structure

### 🎯 Smart Detection
- Controller name extraction from file path and class declaration
- Action method detection based on cursor position
- Model type parsing from user input
- Project structure analysis

## Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Visual Studio Code
- TypeScript knowledge

### Building the Extension

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch

# Package for distribution
npm run package
```

### Testing the Extension

1. **Development Testing**:
   - Press `F5` in VS Code to launch Extension Development Host
   - Open a .NET project in the new window
   - Test commands using Command Palette or context menus

2. **Unit Testing**:
   ```bash
   npm test
   ```

3. **Manual Testing**:
   - Use the provided `demo/ProductController.cs` file
   - Test view generation from different action methods
   - Verify template output and folder structure

## Commands Reference

### Registered Commands
```json
{
  "aspnetcore-view-helper.generateView": "Generate single view from controller",
  "aspnetcore-view-helper.scaffoldCRUD": "Generate all CRUD views",
  "aspnetcore-view-helper.generateDefaultTemplates": "Create essential MVC files",
  "aspnetcore-view-helper.goToModelDefinition": "Navigate to model class"
}
```

### Context Menus
- **Editor Context** (C# files): Generate View, Go to Model Definition
- **Explorer Context** (Folders): Scaffold CRUD, Generate Default Templates

## Template Customization

### Adding New Templates
1. Create new `.hbs` file in `templates/` directory
2. Use Handlebars syntax for dynamic content:
   ```handlebars
   {{#if model}}@model {{model}}{{/if}}
   <h1>{{actionName}}</h1>
   {{#each properties}}
   <p>{{this}}</p>
   {{/each}}
   ```

3. Update template selection in `generateView()` function

### Template Variables
Available variables in templates:
- `{{actionName}}` - Controller action name
- `{{controllerName}}` - Controller name
- `{{model}}` - Full model type
- `{{modelName}}` - Simple model name
- `{{layoutPage}}` - Layout page path
- `{{properties}}` - Array of model properties
- `{{primaryKeyProperty}}` - Primary key property name
- `{{projectName}}` - Project name

## Extension API Usage

### Key VS Code APIs Used
- `vscode.commands.registerCommand()` - Register extension commands
- `vscode.window.showQuickPick()` - Show selection dialogs
- `vscode.window.showInputBox()` - Get user input
- `vscode.workspace.findFiles()` - Search for files
- `vscode.workspace.openTextDocument()` - Open files
- `vscode.window.showTextDocument()` - Display files

### File System Operations
- `fs.readFileSync()` - Read template files
- `fs.writeFileSync()` - Create generated views
- `fs.mkdirSync()` - Create directory structure
- `path.join()` - Cross-platform path handling

## Debugging Tips

### Common Issues
1. **Template not found**: Check template file paths and names
2. **Controller detection fails**: Verify C# syntax and file structure
3. **View folder creation**: Ensure write permissions and valid paths
4. **Model navigation**: Check file naming conventions and workspace structure

### Debug Commands
```typescript
// Enable debug logging
console.log('Debug info:', variable);

// VS Code output channel
const outputChannel = vscode.window.createOutputChannel('ASP.NET Core View Helper');
outputChannel.appendLine('Debug message');
```

## Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Follow VS Code extension conventions
- Add JSDoc comments for public functions
- Use async/await for asynchronous operations

### Testing Requirements
- Test all commands with various inputs
- Verify template output correctness
- Check error handling and edge cases
- Test on different project structures

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit pull request with detailed description

## Future Enhancements

### Planned Features
- [ ] EF Core model detection and scaffolding
- [ ] Enhanced property type detection
- [ ] Razor diagnostics and validation
- [ ] Integration with dotnet CLI tools
- [ ] Custom template management
- [ ] Preview functionality
- [ ] Bulk operations

### Technical Improvements
- [ ] Better error handling and user feedback
- [ ] Performance optimization for large projects
- [ ] Configurable settings and preferences
- [ ] Localization support
- [ ] Extension API for third-party integration

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Handlebars.js Guide](https://handlebarsjs.com/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

For questions or issues, please check the GitHub repository or create a new issue.