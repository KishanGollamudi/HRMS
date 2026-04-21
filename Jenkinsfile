pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run backend tests')
    booleanParam(name: 'RUN_FRONTEND_TESTS', defaultValue: false, description: 'Run the current frontend Vitest suite. Disabled by default because this branch has stale frontend tests.')
    booleanParam(name: 'DEPLOY_WITH_DOCKER_COMPOSE', defaultValue: false, description: 'Build and deploy containers using docker compose')
  }

  environment {
    BACKEND_DIR = 'backend'
    FRONTEND_DIR = 'frontend'
    DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    CI_DB_CONTAINER = 'sprintflow-ci-mysql'
    CI_DB_NAME = 'sprintflow_db'
    CI_DB_USER = 'sprintflow'
    CI_DB_PASSWORD = 'sprintflow123'
    CI_DB_PORT = '3307'
    APP_JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    APP_MAIL_KEY = '0123456789abcdef0123456789abcdef'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend Build') {
      steps {
        dir("${env.BACKEND_DIR}") {
          sh 'chmod +x mvnw'
          sh './mvnw -B -ntp clean package -DskipTests'
          sh 'test -n "$(find target -maxdepth 1 -name \"*.jar\" -print -quit)"'
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir("${env.FRONTEND_DIR}") {
          sh 'npm ci'
          sh 'npm run build'
          sh 'test -d dist'
        }
      }
    }

    stage('Tests') {
      when {
        expression { return params.RUN_TESTS }
      }
      parallel {
        stage('Backend Tests') {
          steps {
            sh '''
              docker rm -f "$CI_DB_CONTAINER" >/dev/null 2>&1 || true
              docker run -d --name "$CI_DB_CONTAINER" \
                -e MYSQL_ROOT_PASSWORD=rootpassword \
                -e MYSQL_DATABASE="$CI_DB_NAME" \
                -e MYSQL_USER="$CI_DB_USER" \
                -e MYSQL_PASSWORD="$CI_DB_PASSWORD" \
                -p "$CI_DB_PORT":3306 \
                mysql:8.0

              for i in $(seq 1 60); do
                if docker exec "$CI_DB_CONTAINER" mysqladmin ping -h 127.0.0.1 -u"$CI_DB_USER" -p"$CI_DB_PASSWORD" --silent; then
                  exit 0
                fi
                sleep 2
              done

              docker logs "$CI_DB_CONTAINER"
              exit 1
            '''
            dir("${env.BACKEND_DIR}") {
              sh '''
                DB_URL="jdbc:mysql://127.0.0.1:${CI_DB_PORT}/${CI_DB_NAME}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" \
                DB_USERNAME="$CI_DB_USER" \
                DB_PASSWORD="$CI_DB_PASSWORD" \
                DDL_AUTO="update" \
                APP_JWT_SECRET="$APP_JWT_SECRET" \
                APP_MAIL_KEY="$APP_MAIL_KEY" \
                ./mvnw -B -ntp test
              '''
            }
          }
          post {
            always {
              junit allowEmptyResults: true, testResults: 'backend/target/surefire-reports/*.xml'
              sh 'docker rm -f "$CI_DB_CONTAINER" >/dev/null 2>&1 || true'
            }
          }
        }

        stage('Frontend Tests') {
          when {
            expression { return params.RUN_FRONTEND_TESTS }
          }
          steps {
            dir("${env.FRONTEND_DIR}") {
              sh 'npm test'
            }
          }
        }
      }
    }

    stage('Docker Compose Config') {
      when {
        expression { return params.DEPLOY_WITH_DOCKER_COMPOSE }
      }
      steps {
        sh '''
          APP_JWT_SECRET="$APP_JWT_SECRET" \
          APP_MAIL_KEY="$APP_MAIL_KEY" \
          APP_CORS_ORIGINS="http://localhost:5173,http://localhost:3000" \
          APP_FRONTEND_URL="http://localhost" \
          VITE_API_BASE_URL="http://localhost:8080" \
          VITE_WS_URL="ws://localhost:8080" \
          docker compose -f "$DOCKER_COMPOSE_FILE" config
        '''
      }
    }

    stage('Docker Compose Deploy') {
      when {
        expression { return params.DEPLOY_WITH_DOCKER_COMPOSE }
      }
      steps {
        sh '''
          APP_JWT_SECRET="$APP_JWT_SECRET" \
          APP_MAIL_KEY="$APP_MAIL_KEY" \
          APP_CORS_ORIGINS="http://localhost:5173,http://localhost:3000" \
          APP_FRONTEND_URL="http://localhost" \
          VITE_API_BASE_URL="http://localhost:8080" \
          VITE_WS_URL="ws://localhost:8080" \
          docker compose -f "$DOCKER_COMPOSE_FILE" build

          APP_JWT_SECRET="$APP_JWT_SECRET" \
          APP_MAIL_KEY="$APP_MAIL_KEY" \
          APP_CORS_ORIGINS="http://localhost:5173,http://localhost:3000" \
          APP_FRONTEND_URL="http://localhost" \
          VITE_API_BASE_URL="http://localhost:8080" \
          VITE_WS_URL="ws://localhost:8080" \
          docker compose -f "$DOCKER_COMPOSE_FILE" up -d
        '''
      }
    }
  }

  post {
    success {
      echo 'Pipeline completed successfully.'
    }
    failure {
      echo 'Pipeline failed. Check logs for details.'
    }
    always {
      archiveArtifacts artifacts: 'backend/target/*.jar, frontend/dist/**', allowEmptyArchive: true
      sh 'command -v docker >/dev/null 2>&1 && docker rm -f "$CI_DB_CONTAINER" >/dev/null 2>&1 || true'
    }
  }
}
