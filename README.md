# README.md

## Kibana-Boost Tampermonkey User Script

Welcome to the Kibana-Boost Tampermonkey User Script repository! This script enhances your Kibana experience by adding several useful features to the Discover tab.

### Features

1. **Pretty Print and Syntax Highlighting for XML and JSON Results**
    - Automatically formats and adds syntax highlighting to XML and JSON data in the Discover tab for better readability.

2. **Copy Button for Discover Results**
    - Adds a convenient copy button next to each result in the Discover tab, allowing you to easily copy single values.

3. **Download Results to CSV**
    - Adds a link under the Share menu that lets users download the current search results as a CSV file.

### Installation

1. **Install Tampermonkey**
    - If you don't already have it, install Tampermonkey for your browser. You can find it at [Tampermonkey's website](https://www.tampermonkey.net/).

2. **Install the Script**
    - Click the following link to install the Kibana-Boost script: [Install Script](https://raw.githubusercontent.com/tleish/kibana-boost/main/dist/kibana_boost.user.js).

### Usage

Once installed, the script will automatically activate when you visit the Kibana Discover tab.

- **Pretty Print and Syntax Highlighting**: XML and JSON results will be automatically formatted and highlighted.
- **Copy Button**: A copy button will appear next to each value in the Discover results. Click it to copy the value to your clipboard.
- **Download CSV**: Open the Share menu and click the new "Download CSV" link to export your results.

### Development

To contribute or modify the script, follow these steps:

1. Clone this repository:
    ```bash
    git clone https://github.com/your-username/kibana-boost.git
    ```
2. Open the repository:
    ```bash
    cd kibana-boost
    ```
3. Make your changes to the files in `src/` directory.
4. Run npm run build to compile the script:
    ```bash
    npm run build
    ```
4. Test your changes by loading the script into Tampermonkey:
    - Open Tampermonkey Dashboard.
    - Click on the `+` tab to add a new script.
    - Paste your modified script and save.

### Contributing

We welcome contributions! Please fork this repository and submit pull requests for any features, enhancements, or bug fixes.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Thank you for using Kibana-Boost! We hope this script makes your Kibana experience even better.
