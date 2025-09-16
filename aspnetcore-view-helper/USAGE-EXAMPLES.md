# Usage Examples

## Quick Start Guide

### 1. Generate a Single View

**Scenario**: You have a controller action and want to create a view for it.

```csharp
public class ProductController : Controller
{
    public IActionResult Details(int id) // <- Place cursor here
    {
        return View();
    }
}
```

**Steps**:
1. Position cursor on the `Details` method
2. Right-click → "Generate View"
3. Select "Details" template
4. Enter model type: `MyApp.Models.Product`
5. Choose "Yes" for layout

**Result**: Creates `Views/Product/Details.cshtml`:
```html
@model MyApp.Models.Product

@{
    Layout = "_Layout";
    ViewData["Title"] = "Details";
}

<h1>Details</h1>

<div>
    <h4>Product</h4>
    <hr />
    <dl class="row">
        <dt class = "col-sm-2">
            @Html.DisplayNameFor(model => model.Id)
        </dt>
        <dd class = "col-sm-10">
            @Html.DisplayFor(model => model.Id)
        </dd>
        <!-- More properties... -->
    </dl>
</div>
```

### 2. Scaffold Complete CRUD Views

**Scenario**: You need all CRUD operations for a model.

**Steps**:
1. Right-click on project folder in Explorer
2. Select "Scaffold CRUD Views"
3. Enter model type: `MyApp.Models.Product`
4. Enter controller name: `Product`
5. Choose layout preference

**Result**: Creates 5 view files:
- `Views/Product/Index.cshtml` - List all products
- `Views/Product/Create.cshtml` - Create new product
- `Views/Product/Edit.cshtml` - Edit existing product
- `Views/Product/Details.cshtml` - View product details
- `Views/Product/Delete.cshtml` - Delete confirmation

### 3. Set Up Default MVC Structure

**Scenario**: Starting a new MVC project and need the basic view infrastructure.

**Steps**:
1. Right-click on project root in Explorer
2. Select "Generate Default MVC Templates"

**Result**: Creates essential files:
```
Views/
├── _ViewStart.cshtml      # Sets default layout
├── _ViewImports.cshtml    # Global imports and tag helpers
└── Shared/
    ├── _Layout.cshtml     # Main layout with Bootstrap
    └── Error.cshtml       # Error page
```

### 4. Navigate to Model Definition

**Scenario**: You're working in a view and want to see the model definition.

```html
@model MyApp.Models.Product  <!-- <- Position cursor on "Product" -->

<h1>Product Details</h1>
```

**Steps**:
1. Position cursor on model type name
2. Right-click → "Go to Model Definition"

**Result**: Opens `Models/Product.cs` and positions cursor at class declaration.

### 5. Using Razor Snippets

**Scenario**: Writing Razor views and need common patterns.

**Available Snippets**:

| Prefix | Expands To | Use Case |
|--------|------------|----------|
| `@model` | `@model ModelType` | Set view model |
| `foreach` | `@foreach (var item in Model) { }` | Loop through collection |
| `if` | `@if (condition) { }` | Conditional rendering |
| `form` | `<form asp-action="ActionName">` | Create form |
| `input` | `<input asp-for="Property" />` | Input field |
| `editorfor` | `@Html.EditorFor(model => model.Property)` | Form editor |

**Example Usage**:
1. Open any `.cshtml` file
2. Type `foreach` and press Tab
3. Template expands to:
```html
@foreach (var item in Model)
{
    // Content
}
```

## Advanced Examples

### Custom Template with Complex Model

```csharp
public class OrderController : Controller
{
    public IActionResult Summary(int orderId)
    {
        return View();
    }
}
```

Generated view with model `MyApp.Models.Order`:
```html
@model MyApp.Models.Order

@{
    Layout = "_Layout";
    ViewData["Title"] = "Summary";
}

<h1>Summary</h1>

<p>Model type: MyApp.Models.Order</p>
```

### CRUD for Complex Business Model

For a model like:
```csharp
public class Customer
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public DateTime DateOfBirth { get; set; }
    public bool IsActive { get; set; }
}
```

The extension generates appropriate forms:
```html
<!-- Create.cshtml excerpt -->
<div class="form-group">
    <label asp-for="FirstName" class="control-label"></label>
    <input asp-for="FirstName" class="form-control" />
    <span asp-validation-for="FirstName" class="text-danger"></span>
</div>
<div class="form-group">
    <label asp-for="Email" class="control-label"></label>
    <input asp-for="Email" class="form-control" />
    <span asp-validation-for="Email" class="text-danger"></span>
</div>
```

## Integration with Existing Projects

### Working with Existing Controllers
The extension detects existing controller patterns and generates views that match your project structure.

### Area Support
When working in areas, the extension respects the area structure:
```
Areas/
└── Admin/
    └── Views/
        └── Product/
            ├── Index.cshtml
            ├── Create.cshtml
            └── Edit.cshtml
```

### Custom Layouts
Specify custom layouts during view generation:
- Enter `~/Views/Shared/_AdminLayout.cshtml` for custom layout
- Leave empty for no layout (`Layout = null;`)

## Troubleshooting

### Common Issues

**Issue**: "Could not detect controller or action method"
**Solution**: Ensure cursor is positioned on or near a public method in a controller class.

**Issue**: "No workspace folder found"
**Solution**: Open your .NET project as a workspace folder in VS Code.

**Issue**: Generated view doesn't include model properties
**Solution**: This is expected - the extension uses placeholder properties. Customize the generated view with your actual model properties.

### Best Practices

1. **Organize Controllers**: Keep controllers in a `Controllers/` folder
2. **Model Naming**: Use full namespace when specifying model types
3. **Consistent Structure**: Follow ASP.NET Core conventions for best results
4. **Template Customization**: Modify generated views to fit your specific requirements

---

This extension significantly speeds up ASP.NET Core MVC development by automating repetitive view creation tasks while maintaining flexibility for customization.