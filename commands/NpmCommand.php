<?php

namespace App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\EventListener\ErrorListener;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class NpmDevCommand extends Command
{
    protected function configure()
    {
        $this->setName('npm:dev')
            ->setDescription('Run npm dev with error logging');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $logger = new Logger('npm-dev');
        $logger->pushHandler(new StreamHandler('logs/npm-dev.log', Logger::DEBUG));
        
        $errorListener = new ErrorListener($logger);
        
        try {
            $process = proc_open('npm run dev', [], $pipes);
            $output->writeln('Running npm dev...');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $logger->critical($e->getMessage());
            $output->writeln('Error logged to logs/npm-dev.log');
            return Command::FAILURE;
        }
    }
}
