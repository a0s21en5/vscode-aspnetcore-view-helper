#!/usr/bin/env node

/**
 * Test script for ASP.NET Core View Helper extension
 * Run this to verify that all templates compile correctly
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

console.log('🧪 Testing ASP.NET Core View Helper Templates\n');

const templatesDir = path.join(__dirname, 'templates');
const testData = {
    actionName: 'TestAction',
    controllerName: 'TestController',
    model: 'TestApp.Models.Product',
    modelName: 'Product',
    layoutPage: '_Layout',
    properties: ['Id', 'Name', 'Description', 'Price'],
    primaryKeyProperty: 'Id',
    projectName: 'TestApplication'
};

// Test all Handlebars templates
const hbsFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.hbs'));

console.log('📝 Testing Handlebars Templates:');
hbsFiles.forEach(file => {
    try {
        const templatePath = path.join(templatesDir, file);
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(templateContent);
        const result = template(testData);
        
        console.log(`✅ ${file} - Compiled successfully`);
        
        // Verify essential content is present
        if (file === 'index.hbs' && !result.includes('Create New')) {
            console.log(`⚠️  ${file} - Missing expected content`);
        }
        if (file.includes('create') && !result.includes('form')) {
            console.log(`⚠️  ${file} - Missing form element`);
        }
        
    } catch (error) {
        console.log(`❌ ${file} - Error: ${error.message}`);
    }
});

// Test static templates
console.log('\n📄 Testing Static Templates:');
const staticFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.cshtml'));

staticFiles.forEach(file => {
    try {
        const templatePath = path.join(templatesDir, file);
        const content = fs.readFileSync(templatePath, 'utf8');
        
        if (content.length > 0) {
            console.log(`✅ ${file} - Content loaded`);
        } else {
            console.log(`⚠️  ${file} - Empty file`);
        }
        
    } catch (error) {
        console.log(`❌ ${file} - Error: ${error.message}`);
    }
});

// Test snippets
console.log('\n✂️  Testing Snippets:');
try {
    const snippetsPath = path.join(__dirname, 'snippets', 'razor.json');
    const snippets = JSON.parse(fs.readFileSync(snippetsPath, 'utf8'));
    
    const snippetCount = Object.keys(snippets).length;
    console.log(`✅ razor.json - ${snippetCount} snippets loaded`);
    
    // Verify some essential snippets exist
    const essentialSnippets = ['Model directive', 'EditorFor', 'Foreach loop', 'If condition'];
    essentialSnippets.forEach(snippet => {
        if (snippets[snippet]) {
            console.log(`  ✓ ${snippet}`);
        } else {
            console.log(`  ❌ Missing: ${snippet}`);
        }
    });
    
} catch (error) {
    console.log(`❌ Snippets - Error: ${error.message}`);
}

// Test package.json configuration
console.log('\n📦 Testing Package Configuration:');
try {
    const packagePath = path.join(__dirname, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check essential fields
    const requiredFields = ['name', 'displayName', 'description', 'main', 'contributes'];
    requiredFields.forEach(field => {
        if (pkg[field]) {
            console.log(`✅ ${field} - Present`);
        } else {
            console.log(`❌ ${field} - Missing`);
        }
    });
    
    // Check commands
    const commands = pkg.contributes?.commands || [];
    console.log(`✅ Commands - ${commands.length} registered`);
    
    // Check menus
    const menus = pkg.contributes?.menus || {};
    const menuCount = Object.keys(menus).length;
    console.log(`✅ Menus - ${menuCount} contexts configured`);
    
} catch (error) {
    console.log(`❌ Package.json - Error: ${error.message}`);
}

console.log('\n🎉 Test completed!');
console.log('\n💡 To test the extension:');
console.log('   1. Press F5 in VS Code to launch Extension Development Host');
console.log('   2. Open a .NET project in the new window');
console.log('   3. Try the commands from the Command Palette or context menus');
console.log('   4. Test with the demo/ProductController.cs file');