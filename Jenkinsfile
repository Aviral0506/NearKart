pipeline {
    agent any

    environment {
        // Replace these with your actual Docker Hub username
        DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
        DOCKER_USERNAME = 'your_dockerhub_username'
        
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/nearkart-frontend"
        BACKEND_IMAGE = "${DOCKER_USERNAME}/nearkart-backend"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                // This checks out the code from the GitHub webhook trigger
                checkout scm
                echo 'Code checkout complete.'
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('server') {
                    // Assuming you have tests. If not, this just installs dependencies to ensure it builds.
                    sh 'npm install'
                    // sh 'npm test' // Uncomment when you have tests
                }
            }
        }

        stage('Build & Test Frontend') {
            steps {
                dir('client') {
                    sh 'npm install'
                    // sh 'npm run build' // Test if the build works
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Backend Image...'
                dir('server') {
                    sh "docker build -t ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${IMAGE_TAG} ."
                }
                
                echo 'Building Frontend Image...'
                dir('client') {
                    // Replace the API URL with your production URL if needed
                    sh "docker build --build-arg VITE_API_URL=http://localhost:5000 -t ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Logging into Docker Hub...'
                withCredentials([usernamePassword(credentialsId: "${DOCKER_HUB_CREDENTIALS_ID}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                    
                    echo 'Pushing Images...'
                    sh "docker push ${BACKEND_IMAGE}:latest"
                    sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                    sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // For a local Jenkins, you might just restart docker-compose here.
                // In a real EC2 scenario, you would SSH into your production server and run docker pull and docker-compose up
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            // Clean up old images to save space
            sh 'docker image prune -f'
        }
        success {
            echo 'Deployment Successful! ✅'
        }
        failure {
            echo 'Deployment Failed! ❌'
        }
    }
}
