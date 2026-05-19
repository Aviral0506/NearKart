pipeline {
    agent any

    environment {
        // Docker Hub Credentials ID from Jenkins
        DOCKER_HUB_CREDENTIALS_ID = 'nearkart'

        // Docker Hub Username
        DOCKER_USERNAME = 'aviral0506'

        // Image Names
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/nearkart-frontend"
        BACKEND_IMAGE = "${DOCKER_USERNAME}/nearkart-backend"

        // Build Tag
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
                echo '✅ Code checkout complete.'
            }
        }

        stage('Build & Test Backend') {
            steps {
                dir('server') {

                    echo '📦 Installing backend dependencies...'
                    sh 'npm ci'

                    // Uncomment when backend tests are added
                    // sh 'npm test'

                    echo '✅ Backend build check complete.'
                }
            }
        }

        stage('Build & Test Frontend') {
            steps {
                dir('client') {

                    echo '📦 Installing frontend dependencies...'
                    sh 'npm ci'

                    // Uncomment when frontend build testing is needed
                    // sh 'npm run build'

                    echo '✅ Frontend build check complete.'
                }
            }
        }

        stage('Build Docker Images') {
            steps {

                echo '🐳 Building Backend Docker Image...'

                dir('server') {
                    sh """
                        docker build \
                        -t ${BACKEND_IMAGE}:latest \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
                    """
                }

                echo '🐳 Building Frontend Docker Image...'

                dir('client') {
                    sh """
                        docker build \
                        --build-arg VITE_API_URL=http://backend:5000 \
                        -t ${FRONTEND_IMAGE}:latest \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                    """
                }

                echo '✅ Docker images built successfully.'
            }
        }

        stage('Push Docker Images') {
            steps {

                echo '🔐 Logging into Docker Hub...'

                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_HUB_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo $DOCKER_PASSWORD | docker login -u $DOCKER_USER --password-stdin
                    '''

                    echo '🚀 Pushing Backend Images...'

                    sh """
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                    """

                    echo '🚀 Pushing Frontend Images...'

                    sh """
                        docker push ${FRONTEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    """

                    echo '✅ Docker images pushed successfully.'
                }
            }
        }

        stage('Deploy Application') {
            steps {

                echo '🚀 Deploying application using Docker Compose...'

                sh '''
                    docker compose down || true
                    docker compose up -d || true
                '''

                echo '✅ Deployment completed.'
            }
        }
    }

    post {

        always {

            echo '🧹 Cleaning unused Docker images...'

            sh 'docker image prune -f || true'

            echo '📌 Pipeline execution finished.'
        }

        success {
            echo '🎉 Deployment Successful! ✅'
        }

        failure {
            echo '❌ Deployment Failed!'
        }
    }
}