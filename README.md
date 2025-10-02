# vscode-aspnetcore-view-helper

A Visual Studio Code extension that streamlines ASP.NET Core MVC development by providing intelligent view scaffolding and generation capabilities.

## Features

- **Smart View Generation**: Generate Razor views from controller actions
- **CRUD Scaffolding**: Complete CRUD view scaffolding with model detection  
- **Template System**: Pre-built templates (Index, Create, Edit, Details, Delete)
- **Model Navigation**: Jump to model definitions from views
- **Razor Snippets**: Code snippets for faster development

## Quick Start

### Generate Single View

1. Open a controller file (.cs)
2. Right-click in an action method → "Generate View"
3. Select template and configure options

### Scaffold CRUD Views  

1. Right-click folder in Explorer → "Scaffold CRUD Views"
2. Enter model type (e.g., `MyApp.Models.Product`)
3. Enter controller name

## Commands

- `ASP.NET Core: Generate View` - Generate view from controller action
- `ASP.NET Core: Scaffold CRUD Views` - Generate complete CRUD views
- `ASP.NET Core: Go to Model Definition` - Navigate from view to model
- `ASP.NET Core: Generate Default Templates` - Create MVC templates

## Configuration

```json
{
  "vscode-aspnetcore-view-helper.defaultTemplateDirectory": "Views",
  "vscode-aspnetcore-view-helper.useLayoutByDefault": true,
  "vscode-aspnetcore-view-helper.defaultLayoutName": "_Layout",
  "vscode-aspnetcore-view-helper.enableLogging": false
}
```

## Requirements

- ASP.NET Core project with .csproj file
- VS Code 1.104.0+

## License

MIT
| **Generate View** | Create a single view from controller action | Available via context menu |
| **Scaffold CRUD Views** | Generate complete CRUD view set | Available via context menu |
| **Generate Default Templates** | Create MVC layout and shared templates | Available via context menu |
| **Go to Model Definition** | Navigate from `@model` directive to model file | Available via context menu |

## ⚙️ Configuration

Access settings via `File → Preferences → Settings` and search for "vscode-aspnetcore-view-helper":

```json
{
  "vscode-aspnetcore-view-helper.defaultTemplateDirectory": "Views",
  "vscode-aspnetcore-view-helper.useLayoutByDefault": true,
  "vscode-aspnetcore-view-helper.defaultLayoutName": "_Layout",
  "vscode-aspnetcore-view-helper.enableLogging": false
}
```

### Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| `defaultTemplateDirectory` | Default directory for generated views | `"Views"` |
| `useLayoutByDefault` | Use layout page by default in generated views | `true` |
| `defaultLayoutName` | Default layout page name | `"_Layout"` |
| `enableLogging` | Enable detailed logging for debugging | `false` |

## 🎨 Supported Templates

### View Templates

- **Empty**: Minimal view template
- **Index**: List view for displaying multiple items
- **Create**: Form for creating new items
- **Edit**: Form for editing existing items
- **Details**: Read-only view for displaying item details
- **Delete**: Confirmation view for deleting items

### Default MVC Templates

- `_Layout.cshtml`: Main layout template
- `_ViewStart.cshtml`: View start configuration
- `_ViewImports.cshtml`: Global view imports
- `Error.cshtml`: Error page template

## 🔍 Smart Model Detection

The extension automatically detects and parses C# model properties with support for:

- **Data Types**: All C# primitive types, DateTime, Guid, etc.
- **Attributes**: Data annotations like `[Required]`, `[Display]`, `[StringLength]`
- **HTML Input Types**: Intelligent mapping to appropriate HTML input types
- **Validation**: Automatic validation attribute generation
- **Primary Keys**: Auto-detection of ID properties

### Supported Attributes

- `[Required]`, `[Display]`, `[Description]`
- `[StringLength]`, `[MaxLength]`, `[MinLength]`
- `[EmailAddress]`, `[Phone]`, `[Url]`
- `[Key]`, `[DatabaseGenerated]`

## 🛠️ Development

### Prerequisites

- Node.js 18+
- VS Code 1.104.0+
- TypeScript 5.9+

### Building from Source

```bash
# Clone the repository
git clone https://github.com/a0s21en5/vscode-aspnetcore-view-helper.git
cd vscode-aspnetcore-view-helper

# Install dependencies
npm install

# Build the extension
npm run build

# Package for distribution
npm run package:vsix
```

### Scripts

```bash
npm run compile          # Development build
npm run watch           # Watch mode
npm run package         # Production build
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier
npm test               # Run tests
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a Pull Request

## 📊 Performance Features

- **⚡ Caching**: Model parsing results cached for better performance
- **🔄 Async Operations**: Non-blocking file operations
- **📦 Bundle Optimization**: Webpack optimized for minimal bundle size
- **🎯 Lazy Loading**: Components loaded on demand

## 🔧 Troubleshooting

### Common Issues

**Q: Views not generating in correct location**
A: Check that you're in an ASP.NET Core project with a `.csproj` file. The extension searches for the project root automatically.

**Q: Model properties not detected**
A: Ensure your model files are in standard locations (`Models/`, `Entities/`, `Domain/`) and follow C# naming conventions.

**Q: Template not found errors**
A: Verify the extension is installed correctly and templates exist in the extension folder.

### Debug Mode

Enable detailed logging in settings:

```json
{
  "vscode-aspnetcore-view-helper.enableLogging": true
}
```

View logs: `View → Output → vscode-aspnetcore-view-helper`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Visual Studio's scaffolding functionality
- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Uses [Handlebars.js](https://handlebarsjs.com/) for templating

## 📞 Support

- 🐛 [Report Issues](https://github.com/a0s21en5/vscode-aspnetcore-view-helper/issues)
- 💡 [Feature Requests](https://github.com/a0s21en5/vscode-aspnetcore-view-helper/issues)
- 📧 [Contact](mailto:your-email@example.com)

---

**Happy Coding!** 🎉
