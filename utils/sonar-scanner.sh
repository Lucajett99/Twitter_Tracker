#!/bin/bash
if [ -z $1 ]; then
	printf "Usage:\n./sonar-scanner.sh install <directory>\nor\n./sonar-scanner.sh run\n"
	exit 1
fi
if [ $1 == 'run' ]; then
	if [ -x "$(sonar-scanner -v)" ]; then
		printf "You must install the sonar-scanner by using ./sonar-scanner.sh install <directory>\n"
		exit 1
	else
		sonar-scanner \
		-Dsonar.projectKey=twitter-tracker-team-4 \
		-Dsonar.sources=. \
		-Dsonar.host.url=http://aminsep.disi.unibo.it:9000 \
		-Dsonar.login=88d33c465a8db4b6c686f9987d5e29a89fc25798 \
		-Dsonar.dynamicAnalysis="reuseReports" \
    	-Dsonar.typescript.lcov.reportPaths="./server/coverage/lcov.info"
	fi
elif [ $1 == 'install' ]; then
	if [ -z $2 ]; then
		printf "Usage: ./sonar-scanner.sh install <directory>\n"
		exit 1
	else
		cd $(mktemp -d)
		wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.5.0.2216-linux.zip
		unzip sonar-scanner-cli-4.5.0.2216-linux.zip -d $2
		mv $2/sonar-scanner-4.5.0.2216-linux $2/sonar-scanner
		printf "\nexport PATH=\$PATH:$2/sonar-scanner/bin\n" >> ~/.bashrc
	fi
fi
