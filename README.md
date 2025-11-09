 <!-- PROJECT SHIELDS -->
[![Wiki](https://img.shields.io/badge/Wiki-brightgreen.svg?style=for-the-badge)](https://github.com/UOA-CS732-S1-2025/group-project-peach-peacocks/wiki)


<br />
<div align="center">
 <h2 align="center">IntelliMock</h2>
 


 <img src="assets/images/team_logo.png" alt="Team Peach Peacocks Logo" width="110"/>


 <p align="center">
 <strong>AI-powered mock interview simulator</strong>
 <br />
 <br />
</p>
<a href="https://github.com/UOA-CS732-S1-2025/group-project-peach-peacocks/issues/new?labels=bug&template=bug_report.md">Report Bug</a>
·
<a href="https://github.com/UOA-CS732-S1-2025/group-project-peach-peacocks/issues/new?labels=enhancement&template=feature_request.md">Request Feature</a>
·
<a href="https://github.com/UOA-CS732-S1-2025/group-project-peach-peacocks/issues/new?labels=documentation&template=documentation.md">Documention</a>


</div>
<br />


<!-- TABLE OF CONTENTS -->
<details>
 <summary>Table of Contents</summary>
 <ol>
   <li><a href="#about-the-project">About The Project</a>
     <ul>
       <li><a href="#what-does-this-project-do">What does this project do?</a></li>
       <li><a href="#tech-stack-used">Tech Stack Used</a></li>
       <li><a href="#deployment">Deployment</a></li>
     </ul>
   </li>
   <li><a href="#getting-started">Getting Started</a>
     <ul>
       <li><a href="#prerequisites">Prerequisites</a></li>
       <li><a href="#installation">Installation</a></li>
     </ul>
   </li>
   <li><a href="#running-tests">Running Tests</a></li>
   <li><a href="#license">License</a></li>
   <li><a href="#team-members">Team Members</a></li>
   <li><a href="#acknowledgments">Acknowledgments</a></li>
 </ol>
</details>






<!-- ABOUT THE PROJECT -->
## About The Project




### What does this project do?

<video src="https://github.com/user-attachments/assets/592935ea-3c32-4497-95f6-a6b053d07aa6" controls></video>


**IntelliMock** is an AI-powered mock interview platform designed to help job seekers, especially students and recent graduates, prepare for interviews in a realistic, personalised, and accessible way. It simulates real-world interviews using an intelligent virtual interviewer that adapts dynamically to user input, CVs, job descriptions, and uploaded documents.


The core features of IntelliMock include:


- **AI Interview Simulator** 
 Generates real-time, context-aware interview questions by analysing user-uploaded job-related data such as CVs or job descriptions. The AI adapts dynamically to responses, creating a natural and personalised interview flow.


- **Personalised Feedback System** 
 After each interview session, the AI evaluates user responses based on job-specific context and industry standards, providing tailored scores, strengths, weaknesses, and improvement tips.


- **Exportable Scoring Criteria** 
 Feedback is broken down into transparent scoring components, allowing users to understand their performance clearly. Users can export this evaluation as a downloadable or shareable summary.


- **Job Data Upload** 
 Users can upload CVs, job descriptions, PDFs. This input is parsed to personalise the interview experience and guide the AI in tailoring its questions.


- **Voice Input** 
 Users can speak their responses using built-in speech-to-text functionality, allowing for more realistic practice and helping improve spoken delivery.


 <br />

 ### Example Feedback and Scoring Generated  
 <table style="width: 100%;">
  <tr>
    <td style="width: 100%;"><img src="https://github.com/user-attachments/assets/59799346-2986-4259-9f70-c7d38c3cfede" style="width: 100%; height: auto;" /></td>
    <td style="width: 100%;"><img src="https://github.com/user-attachments/assets/b086f924-85bb-40f5-a6a7-624a9cd95157" style="width: 100%; height: auto;" /></td>
  </tr>
</table>


### Tech Stack Used


![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/SpringBoot-6DB33F?logo=springboot&logoColor=white&style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white&style=for-the-badge)


### Deployment


![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white&style=for-the-badge)
![Render](https://img.shields.io/badge/Render-000000?logo=render&logoColor=white&style=for-the-badge)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4DB33D?logo=mongodb&logoColor=white&style=for-the-badge)

**To view the full deployed Intellimock web app: [IntelliMock](https://intellimock.netlify.app)**
 > NOTE: The frontend and backend is deployed and no further configuration is required so you can visit the link anytime. However, the backend is hosted on a free Render instance, which may spin down after periods of inactivity. This can cause an initial delay of up to 50 seconds when loading the site for the first time after being idle.

 **[For more information on IntelliMock's Deployment](https://github.com/UOA-CS732-S1-2025/group-project-peach-peacocks/wiki/Deployment-Information)**

 <br />


## Getting Started


### Prerequisites


- **Java 17+**
   - Required to run the Spring Boot backend
   - [Download Java 17](https://adoptopenjdk.net/)


- **Node.js 18+**
   - Required to run the React frontend
   - [Download Node.js](https://nodejs.org/)


- **MongoDB (Community Edition)** 
  - Required as the database for the backend  
  - [Download MongoDB](https://www.mongodb.com/try/download/community)


 <br />


### Installation


1. **Clone the repo using Terminal/Command Prompt**:


    ```sh
   git clone https://github.com/bwen12/IntelliMock-Project.git
    ```


2. **Navigate to the project directory**:
    ```sh
   cd group-project-peach-peacocks
    ```
### Frontend


3. **Navigate to the frontend package**:
    ```sh
   cd frontend
    ```
4. **Ensure you copy the .env file**
  > A `.env` file is required to run the frontend. 
  > Place this file in the **root of the `/frontend` folder**, at the same level as `package.json`.


  If you're unsure what variables to include, you should have already received the frontend `.env` file from the **Assignment - Private info / API key / etc submission** on Canvas. 
  If you missed this or need access again, please contact one of the [**team members**](#team-members) listed below via email.


5. **Install frontend dependencies**:


   ```sh
   npm install
   ```
  > If you run into errors here, make sure you have Node.js and npm installed. You can check by running node -v and npm -v in your terminal.
  If they’re not installed or if the versions are outdated check [Prerequisites](#2-prerequisites) to download the latest LTS version.


6. **Start the frontend development server**:


   ```sh
   npm run dev
   ```
> The frontend will run on [http://localhost:5174](http://localhost:5174)


### Backend


6. **Navigate to the backend project**:


   ```sh
   cd ../backend  # or just cd backend if you're not nesting
   ```


7. **Ensure that MongoDB is running locally and accessible at mongodb://localhost:27017.**
   > You can verify the connection using a tool like MongoDB Compass, or by ensuring your Mongo service is running on your machine.


8. **Ensure you copy the .env file**
  > A `.env` file is required to run the backend. 
  > Place this file in the **root of the `/backend` folder**, at the same level as `pom.xml`.


  If you're unsure what variables to include, you should have already received the backend `.env` file from the **Assignment - Private info / API key / etc submission** on Canvas. 
  If you missed this or need access again, please contact one of the [**team members**](#team-members) listed below via email.


9. **Run the Spring Boot backend**:


  ```sh
  ./mvnw spring-boot:run         # Mac/Linux
  mvnw.cmd spring-boot:run     # Windows
  ```
  > If you run into errors here, make sure you have Java 17 or later installed on your system.
You can check by running java -version in your terminal.
If it's not installed or the version is outdated, check [Prerequisites](#2-prerequisites) to download the latest version.
> The backend will run on [http://localhost:8080](http://localhost:8080)


 <br />


## Running Tests

 ### Frontend
 The frontend uses [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/) for unit and integration tests.


  To run all frontend tests:

  1. **Navigate to the frontend package**:
     ```sh
     cd frontend
     ```

  2. **Running All Tests**:
     ```sh
     npx vitest run
     ```
     > This will launch the Vitest test runner in watch mode. All unit and integration tests will be executed, including API services, pages, hooks, UI components, etc.


   3. **Running a Specific Test File**:
      ```sh
      npx vitest run path/to/your/test-file.test.tsx
      ```
      > Replace `path/to/your/test-file.test.tsx` with the correct relative path (e.g. `src/dialog/__tests__/dialog.test.tsx`).
    
   4. **To Check Coverage**:

      ```sh
      npm run test -- --coverage
      ```

  ### Backend
   The backend uses **Junit** with **Mockito** to test our Java Spring Boot backend.

   To run all backend tests:

  1. **Navigate to the backend package**:
     ```sh
     cd backend
     ```
  2. **Running the tests**:
     ```sh
     ./mvnw verify       # Mac/Linux
      mvnw.cmd verify    # Windows
     ```
   3. **To Check Coverage**:

      ```sh
      open target/site/jacoco/index.html    # Mac
      xdg-open target/site/jacoco/index.html # Linux
      start target\site\jacoco\index.html   # Windows
      ```



 <br />


<!-- LICENSE -->
## License


Distributed under the MIT License. Read more at [MIT License](./LICENSE) for more information.


<!-- CONTACTS -->
## Team Members


- Andrew Shin _(hshi270@aucklanduni.ac.nz)_
- Andy Lee _(klee682@aucklanduni.ac.nz)_
- Sahan De Silva _(sdes755@aucklanduni.ac.nz)_
- Shubh Bhargava _(sbha878@aucklanduni.ac.nz)_
- Ben Weng _(bwen761@aucklanduni.ac.nz)_
- Hamish Patel _(hpat874@aucklanduni.ac.nz)_




<!-- ACKNOWLEDGMENTS -->


## Acknowledgments
- [README Template](https://github.com/othneildrew/Best-README-Template?tab=readme-ov-file)
- [Image Shields](https://shields.io)
