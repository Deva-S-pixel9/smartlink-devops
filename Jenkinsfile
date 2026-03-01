pipeline {
  agent any

  environment {
    IMAGE_NAME  = 'deva1205/smartlink'
    APP_SERVER  = '3.239.36.58'
  }

  stages {

    stage('Checkout Code') {
      steps {
        echo '--- Stage 1: Pulling latest code from GitHub ---'
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        echo '--- Stage 2: Installing Node.js packages ---'
        sh 'npm install'
        sh 'echo Dependencies installed successfully'
      }
    }

    stage('Build Docker Image') {
      steps {
        echo '--- Stage 3: Building Docker image ---'
        sh 'docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} .'
        sh 'docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest'
        sh 'echo Docker image built successfully'
      }
    }

    stage('Push to Docker Hub') {
      steps {
        echo '--- Stage 4: Pushing image to Docker Hub ---'
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
          sh 'docker push ${IMAGE_NAME}:${BUILD_NUMBER}'
          sh 'docker push ${IMAGE_NAME}:latest'
          sh 'docker logout'
        }
      }
    }

    stage('Deploy to App Server') {
      steps {
        echo '--- Stage 5: Deploying container to EC2 App Server ---'
        sshagent(['app-server-ssh']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@3.239.36.58 '
              docker pull deva1205/smartlink:latest &&
              docker stop smartlink 2>/dev/null || true &&
              docker rm   smartlink 2>/dev/null || true &&
              docker run -d \
                --name smartlink \
                --restart always \
                -p 3000:3000 \
                deva1205/smartlink:latest &&
              echo Deployment successful!
            '
          '''
        }
      }
    }
  }

  post {
    success {
      echo '========================================='
      echo 'PIPELINE SUCCESS - SmartLink deployed!'
      echo '========================================='
    }
    failure {
      echo 'PIPELINE FAILED - Check the logs above'
    }
  }
}