# DS3 Main Site Documentation 🚀

## Getting Started 🎯

1. Clone the repo with `git clone https://github.com/ucsdds3/main-site.git`
2. Open the repo in your preferred code editor (For VSCode, use the command `code main-site`)
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server

## Contribution Guidelines 🤝

To make contributions to the DS3 Main Site, please follow these guidelines:

1. (Infra members with write access can skip this step) Fork the repository to your own GitHub account and clone it.
2. Create a new branch for your changes using the command `git checkout -b <branch-name>`.
3. Make your changes and push them to your branch.
4. Create a pull request from your branch to the main branch. Write a summary of your changes in the pull request description.
5. Once the pull request is merged, you can safely delete your branch using the command `git branch -d <branch-name>`.

## Project Structure 📁

Stick to the project structure shown below to keep things organized:

```
main-site/  
├── node_modules/         # Installed dependencies  
├── public/               # Public assets  
├── src/                  # Source code files  
│   ├── Assets/           # Project assets  
│   │   ├── Data/         # Data files  
│   │   └── Images/       # Image assets  
│   ├── Components/       # General components  
│   ├── Hooks/            # Custom hooks  
│   ├── Pages/            # Pages  
│   │   └── Example/      # Page-specific components  
│   ├── Styles/           # Custom styles  
│   ├── Utils/            # Utilities  
│   │   ├── functions.ts  # Utility functions  
│   │   └── types.ts      # Utility types  
```

## Dependencies 📦

Check the depencencies listed below for this project before starting. Use these to your advantage so you don't have to do more work! There are more dependencies that you can find in the `package.json` file, but these are the ones you should be familiar with.

- [Vite](https://vitejs.dev/) - Build Tool ⚡
- [React](https://react.dev/) - Frontend Framework ⚛️
- [React Router](https://reactrouter.com/en/main) - Routing 🛣️
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework 🎨
- [React Icons](https://react-icons.github.io/react-icons/) - Icon Library 🖼️
- [Daisy UI](https://daisyui.com/) - Tailwind CSS Component Library 🎯
- [Framer Motion](https://www.framer.com/motion/) - Animation Library ✨
