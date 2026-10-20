node  {
    try {

    stage('Clone repository') {
            /* Let's make sure we have the repository cloned to our workspace */
                checkout scm
            }

    stage('Build image') {
        /* This builds the actual image; synonymous to
         * docker build on the command line */
            sh "docker build -t milvasoft/fine3d_app:latest ."
        }

    stage('Restart Application') {
            sh "docker compose down"
            sh "docker compose up -d"
            echo = "Compose Upppp!"
            try{ 
            sh "yes | docker image prune --filter label=name=mcr.microsoft.com* -a"
            }
            catch (e) {}
    }
    } catch (e) {
        // If there was an exception thrown, the build failed
       currentBuild.result = "FAILED"
       throw e
     } finally {
       // Success or failure, always send notifications
    }
}