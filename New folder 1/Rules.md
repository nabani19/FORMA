# Rules for AI Food Scanner & Nutrition Coach App Development

## 1. General Principles

*   **Security First:** All development must prioritize user data privacy and application security. Implement secure coding practices, data encryption, and regular security audits.
*   **Performance Optimization:** Aim for efficient code and optimized resource usage to ensure a fast and responsive user experience, especially for image processing and data retrieval.
*   **Scalability:** Design components and services to be scalable, anticipating future growth in user base and data volume.
*   **Maintainability:** Write clean, well-documented, and modular code to facilitate future updates, bug fixes, and feature additions.
*   **User-Centric Design:** All design and development decisions should be made with the end-user in mind, focusing on usability, accessibility, and a positive user experience.

## 2. Technical Stack Guidelines

*   **Mobile:**
    *   **MUST Use:** React Native, TypeScript, TailwindCSS.
    *   **AVOID:** Native iOS/Android development unless absolutely necessary for specific performance-critical features not achievable with React Native.
*   **Backend:**
    *   **MUST Use:** Python (for AI/ML), Node.js (for API/business logic), FastAPI, Express.js.
    *   **Database:** PostgreSQL for structured data, MongoDB for flexible/unstructured food data.
    *   **Cloud:** AWS services as outlined in `Architecture.md`.
    *   **AVOID:** Proprietary cloud services that lead to vendor lock-in where open-source alternatives exist.

## 3. AI/ML Model Guidelines

*   **Data Privacy:** Ensure all training data is anonymized and complies with privacy regulations. User-submitted images must be handled securely and only used for model improvement with explicit user consent.
*   **Bias Mitigation:** Actively work to identify and mitigate biases in AI models to ensure fair and accurate results across diverse user demographics and food types.
*   **Explainability:** Where possible, design AI models to provide some level of explainability for their predictions, especially in coaching recommendations.
*   **Continuous Improvement:** Implement mechanisms for continuous model retraining and improvement based on new data and user feedback.

## 4. Error Handling & Logging

*   Implement robust error handling mechanisms across both frontend and backend to gracefully manage failures and provide informative feedback to users.
*   Centralized logging for all application errors, warnings, and critical events. Use a structured logging format for easier analysis.

## 5. Third-Party Libraries & Services

*   **Selection Criteria:** Prioritize well-maintained, widely adopted, and secure open-source libraries. Evaluate licensing, community support, and security vulnerabilities before integration.
*   **Dependency Management:** Keep third-party dependencies updated to their latest stable versions to benefit from bug fixes and security patches.

## 6. Code Standards

*   Adhere to established coding conventions for TypeScript, React Native, Python, and Node.js.
*   Use linters (ESLint, Prettier, Black) and formatters to enforce consistent code style.
*   Write comprehensive unit and integration tests for all critical components and features.
