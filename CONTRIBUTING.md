# Contributing to GrowCoach

Thank you for your interest in contributing to GrowCoach! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Use a clear, descriptive title
3. Include steps to reproduce the bug
4. Provide error messages and screenshots if applicable
5. Specify your environment (OS, browser, Python/Node versions)

### Suggesting Enhancements
1. Check existing issues for similar suggestions
2. Use a clear, descriptive title
3. Provide detailed description of the enhancement
4. Explain why this enhancement would be useful
5. Include mockups or examples if applicable

### Code Contributions

#### Setting Up Development Environment
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Growcoach.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Follow the installation instructions in README.md
5. Make your changes
6. Test your changes thoroughly
7. Commit and push your changes
8. Create a pull request

#### Code Style Guidelines

##### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write docstrings for functions and classes
- Keep functions small and focused
- Use meaningful variable names

Example:
```python
def create_user(email: str, password: str) -> dict:
    """
    Create a new user account.
    
    Args:
        email: User's email address
        password: User's password
        
    Returns:
        dict: Created user data
    """
    # Implementation here
```

##### TypeScript/React (Frontend)
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use meaningful prop names

Example:
```tsx
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  // Component implementation
};
```

#### Testing Guidelines
- Write unit tests for new features
- Ensure all existing tests pass
- Test edge cases and error conditions
- Test both backend and frontend changes

#### Commit Message Guidelines
Use clear, descriptive commit messages:

```
feat: add user profile upload functionality
fix: resolve login authentication issue
docs: update API documentation
style: improve mobile responsiveness
test: add unit tests for user model
refactor: simplify authentication logic
```

## 📋 Development Workflow

1. **Create an Issue**: Before starting work, create an issue describing the feature or bug
2. **Fork & Clone**: Fork the repository and clone it locally
3. **Branch**: Create a feature branch from main
4. **Develop**: Make your changes following the guidelines above
5. **Test**: Run all tests and ensure they pass
6. **Document**: Update documentation if needed
7. **Pull Request**: Create a pull request with a clear description

## 🚀 Pull Request Process

1. **Title**: Use a clear, descriptive title
2. **Description**: Provide detailed description of changes
3. **Link Issues**: Reference related issues
4. **Screenshots**: Include screenshots for UI changes
5. **Tests**: Ensure all tests pass
6. **Documentation**: Update documentation if needed

### Pull Request Template
```
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Fixes #123
```

## 🔍 Code Review Process

1. All pull requests require review from maintainers
2. Reviews focus on code quality, functionality, and adherence to guidelines
3. Address feedback promptly and professionally
4. Maintainers may request changes before merging

## 📚 Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🆘 Getting Help

- Create an issue for bugs or feature requests
- Join our community discussions
- Contact maintainers directly for urgent issues

## 📝 License

By contributing to GrowCoach, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to GrowCoach! 🎉
