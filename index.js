const { Wallet, utils } = require('ethers');
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
const fs = require('fs/promises');
const readline = require('readline');


const Fore = {
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    MAGENTA: '\x1b[35m',
    CYAN: '\x1b[36m',
    WHITE: '\x1b[37m'
};
const Style = {
    BRIGHT: '\x1b[1m',
    RESET_ALL: '\x1b[0m'
};

const USER_AGENT = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0"
];

class Cicada {
    constructor() {
        this.PRIVY_HEADERS = {};
        this.BASE_HEADERS = {};
        this.PRIVY_API = "https://auth.privy.io/api/v1/siwe";
        this.BASE_API = "https://campaign.cicada.finance/api";
        this.REF_CODE = "cAOX8bPw";
        this.proxies = [];
        this.proxyIndex = 0;
        this.accountProxies = {};
        this.privyId = {};
        this.accessTokens = {};
        this.identityTokens = {};
        this.headerCookies = {};
        this.wibFormatter = new Intl.DateTimeFormat('en-US', {
            year: '2-digit', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false, timeZone: 'Asia/Jakarta'
        });
    }

    clearTerminal() {
        process.stdout.write('\x1Bc'); 
    }

    log(message) {
        console.log(message);
    }

    welcome() {
        const banner = `
${Fore.MAGENTA}${Style.BRIGHT}

 █████╗ ██╗ █████╗  █████╗ ██████╗  █████╗   ██████╗  █████╗ ████████╗
██╔══██╗██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗  ██╔══██╗██╔══██╗╚══██╔══╝
██║  ╚═╝██║██║  ╚═╝███████║██║  ██║███████║  ██████╦╝██║  ██║   ██║
██║  ██╗██║██║  ██╗██╔══██║██║  ██║██╔══██║  ██╔══██╗██║  ██║   ██║
╚█████╔╝██║╚█████╔╝██║  ██║██████╔ ██║  ██║  ██████╦╝╚█████╔╝   ██║
 ╚════╝ ╚═╝ ╚════  ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝  ╚═════╝  ╚════╝    ╚═╝

                     Script Author : Kazmight
            Join Channel Telegram : Dasar Pemulung
     =====================================================
${Style.RESET_ALL}
`;
        console.log(banner);
    }

    formatSeconds(seconds) {
        const hours = Math.floor(seconds / 3600);
        const remainder = seconds % 3600;
        const minutes = Math.floor(remainder / 60);
        const secs = Math.floor(remainder % 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    async loadProxies(useProxyChoice) {
        const filename = "proxy.txt";
        try {
            if (useProxyChoice === 1) { 
                this.log(`${Fore.CYAN}${Style.BRIGHT}Fetching free proxies from proxyscrape...${Style.RESET_ALL}`);
                const response = await axios.get("https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=text", { timeout: 30000 });
                await fs.writeFile(filename, response.data);
                this.proxies = response.data.split('\n').map(line => line.trim()).filter(line => line);
            } else { 
                if (!await fs.access(filename).then(() => true).catch(() => false)) {
                    this.log(`${Fore.RED}${Style.BRIGHT}File ${filename} Not Found.${Style.RESET_ALL}`);
                    return;
                }
                const content = await fs.readFile(filename, 'utf-8');
                this.proxies = content.split('\n').map(line => line.trim()).filter(line => line);
            }

            if (this.proxies.length === 0) {
                this.log(`${Fore.RED}${Style.BRIGHT}No Proxies Found.${Style.RESET_ALL}`);
                return;
            }

            this.log(
                `${Fore.GREEN}${Style.BRIGHT}Proxies Total  : ${Style.RESET_ALL}` +
                `${Fore.WHITE}${Style.BRIGHT}${this.proxies.length}${Style.RESET_ALL}`
            );

        } catch (e) {
            this.log(`${Fore.RED}${Style.BRIGHT}Failed To Load Proxies: ${e.message || e}${Style.RESET_ALL}`);
            this.proxies = [];
        }
    }

    checkProxySchemes(proxy) {
        const schemes = ["http://", "https://", "socks4://", "socks5://"];
        if (schemes.some(scheme => proxy.startsWith(scheme))) {
            return proxy;
        }
        return `http://${proxy}`; 
    }

    getNextProxyForAccount(account) {
        if (!(account in this.accountProxies)) {
            if (this.proxies.length === 0) {
                return null;
            }
            const proxy = this.checkProxySchemes(this.proxies[this.proxyIndex]);
            this.accountProxies[account] = proxy;
            this.proxyIndex = (this.proxyIndex + 1) % this.proxies.length;
        }
        return this.accountProxies[account];
    }

    rotateProxyForAccount(account) {
        if (this.proxies.length === 0) {
            return null;
        }
        const proxy = this.checkProxySchemes(this.proxies[this.proxyIndex]);
        this.accountProxies[account] = proxy;
        this.proxyIndex = (this.proxyIndex + 1) % this.proxies.length;
        return proxy;
    }

    generateAddress(privateKey) {
        try {
            const wallet = new Wallet(privateKey);
            return wallet.address;
        } catch (e) {
            return null;
        }
    }

    async generatePayload(privateKey, address, nonce) {
        try {
            const timestamp = new Date().toISOString().slice(0, -5) + 'Z'; 
            const message = `campaign.cicada.finance wants you to sign in with your Ethereum account:\n${address}\n\nBy signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.\n\nURI: https://campaign.cicada.finance\nVersion: 1\nChain ID: 56\nNonce: ${nonce}\nIssued At: ${timestamp}\nResources:\n- https://privy.io`;

            const wallet = new Wallet(privateKey);
            const signature = await wallet.signMessage(message);

            const payload = {
                message: message,
                signature: signature,
                chainId: "eip155:56",
                walletClientType: "okx_wallet",
                connectorType: "injected",
                mode: "login-or-sign-up"
            };

            return payload;
        } catch (e) {
            throw new Error(`Generate Req Payload Failed: ${e.message || e}`);
        }
    }

    maskAccount(account) {
        try {
            if (!account || account.length < 12) return account;
            return account.substring(0, 6) + '*'.repeat(6) + account.substring(account.length - 6);
        } catch (e) {
            return null;
        }
    }

    async printQuestion() {
        let rl; 
        try {
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const question = (query) => new Promise(resolve => rl.question(query, resolve));

            let choose;
            while (true) {
                try {
                    console.log(`${Fore.WHITE}${Style.BRIGHT}1. Run With Proxy${Style.RESET_ALL}`);
                    console.log(`${Fore.WHITE}${Style.BRIGHT}2. Run Without Proxy${Style.RESET_ALL}`);
                    const input = await question(`${Fore.BLUE}${Style.BRIGHT}Choose [1-2] -> ${Style.RESET_ALL}`);
                    choose = parseInt(input.trim(), 10);

                    if ([1, 2].includes(choose)) {
                        const proxyType = (
                            choose === 1 ? "With Proxy" :
                            "Without"
                        );
                        console.log(`${Fore.GREEN}${Style.BRIGHT}Run ${proxyType} Proxy Selected.${Style.RESET_ALL}`);
                        break;
                    } else {
                        console.log(`${Fore.RED}${Style.BRIGHT}Please enter either 1 or 2.${Style.RESET_ALL}`);
                    }
                } catch (error) {
                    console.log(`${Fore.RED}${Style.BRIGHT}Invalid input. Enter a number (1 or 2).${Style.RESET_ALL}`);
                }
            }

            let rotate = false;
            if (choose === 1) { 
                while (true) {
                    const input = await question(`${Fore.BLUE}${Style.BRIGHT}Rotate Invalid Proxy? [y/n] -> ${Style.RESET_ALL}`);
                    const rotateInput = input.trim().toLowerCase();
                    if (['y', 'n'].includes(rotateInput)) {
                        rotate = (rotateInput === 'y');
                        break;
                    } else {
                        console.log(`${Fore.RED}${Style.BRIGHT}Invalid input. Enter 'y' or 'n'.${Style.RESET_ALL}`);
                    }
                }
            }
            return { choose, rotate };
        } finally {
            if (rl) { 
                rl.close();
            }
        }
    }

    async checkConnection(proxy = null) {
        let agent = null;
        if (proxy) {
            try {
                agent = new SocksProxyAgent(proxy);
            } catch (e) {
                this.log(`${Fore.RED}${Style.BRIGHT}Invalid Proxy URL: ${e.message}${Style.RESET_ALL}`);
                return null;
            }
        }

        try {
            const response = await axios.post("http://ip-api.com/json", {}, {
                timeout: 30000,
                httpsAgent: agent,
                httpAgent: agent,
            });
            if (response.status === 200) {
                return response.data;
            }
            throw new Error(`HTTP Status: ${response.status}`);
        } catch (e) {
            this.log(
                `${Fore.RED}${Style.BRIGHT}Connection Not 200 OK ${Style.RESET_ALL}` +
                `${Fore.MAGENTA}${Style.BRIGHT}-${Style.RESET_ALL}` +
                `${Fore.YELLOW}${Style.BRIGHT} ${e.message || e}${Style.RESET_ALL}`
            );
            return null;
        }
    }

    async init(address, proxy = null, retries = 5) {
        const url = `${this.PRIVY_API}/init`;
        const data = JSON.stringify({ address: address });
        const headers = {
            ...this.PRIVY_HEADERS[address],
            "Content-Length": Buffer.byteLength(data).toString(),
            "Content-Type": "application/json"
        };
        let agent = null;
        if (proxy) {
            try {
                agent = new SocksProxyAgent(proxy);
            } catch (e) {
                this.log(`${Fore.RED}${Style.BRIGHT}Invalid Proxy URL: ${e.message}${Style.RESET_ALL}`);
                return null;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); 

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await axios.post(url, data, {
                    headers: headers,
                    timeout: 60000,
                    httpsAgent: agent,
                    httpAgent: agent,
                    
                });
                return response.data;
            } catch (e) {
                if (attempt < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000)); 
                    continue;
                }
                this.log(
                    `${Fore.RED}${Style.BRIGHT}GET Nonce Failed ${Style.RESET_ALL}` +
                    `${Fore.MAGENTA}${Style.BRIGHT}-${Style.RESET_ALL}` +
                    `${Fore.YELLOW}${Style.BRIGHT} ${e.message || e}${Style.RESET_ALL}`
                );
            }
        }
        return null;
    }

    async authenticate(privateKey, address, nonce, proxy = null, retries = 5) {
        const url = `${this.PRIVY_API}/authenticate`;
        let data;
        try {
            data = JSON.stringify(await this.generatePayload(privateKey, address, nonce));
        } catch (error) {
            this.log(`${Fore.RED}${Style.BRIGHT}Payload generation failed: ${error.message || error}${Style.RESET_ALL}`);
            return null;
        }
        const headers = {
            ...this.PRIVY_HEADERS[address],
            "Content-Length": Buffer.byteLength(data).toString(),
            "Content-Type": "application/json"
        };
        let agent = null;
        if (proxy) {
            try {
                agent = new SocksProxyAgent(proxy);
            } catch (e) {
                this.log(`${Fore.RED}${Style.BRIGHT}Invalid Proxy URL: ${e.message}${Style.RESET_ALL}`);
                return null;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); 

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await axios.post(url, data, {
                    headers: headers,
                    timeout: 60000,
                    httpsAgent: agent,
                    httpAgent: agent,
                });
                return response.data;
            } catch (e) {
                if (attempt < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000)); 
                    continue;
                }
                this.log(
                    `${Fore.RED}${Style.BRIGHT}Login Failed ${Style.RESET_ALL}` +
                    `${Fore.MAGENTA}${Style.BRIGHT}-${Style.RESET_ALL}` +
                    `${Fore.YELLOW}${Style.BRIGHT} ${e.message || e}${Style.RESET_ALL}`
                );
            }
        }
        return null;
    }

    async userVerify(address, proxy = null, retries = 5) {
        const url = `${this.BASE_API}/users/referrals/${this.REF_CODE}?campaignId=440`;
        const headers = {
            ...this.BASE_HEADERS[address],
            "Content-Length": "0",
            "Cookie": this.headerCookies[address]
        };
        let agent = null;
        if (proxy) {
            try {
                agent = new SocksProxyAgent(proxy);
            } catch (e) {
                this.log(`${Fore.RED}${Style.BRIGHT}Invalid Proxy URL: ${e.message}${Style.RESET_ALL}`);
                return null;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); 

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await axios.post(url, null, {
                    headers: headers,
                    timeout: 60000,
                    httpsAgent: agent,
                    httpAgent: agent,
                });
                if ([400, 403].includes(response.status)) {
                    return null;
                }
                return response.data;
            } catch (e) {
                if (e.response && [400, 403].includes(e.response.status)) {
                    return null; 
                }
                if (attempt < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000)); 
                    continue;
                }
                this.log(
                    `${Fore.RED}${Style.BRIGHT}Verify Failed ${Style.RESET_ALL}` +
                    `${Fore.MAGENTA}${Style.BRIGHT}-${Style.RESET_ALL}` +
                    `${Fore.YELLOW}${Style.BRIGHT} ${e.message || e}${Style.RESET_ALL}`
                );
            }
        }
        return null;
    }

    async taskLists(address, proxy = null, retries = 5) {
        const url = `${this.BASE_API}/campaigns/440/tasks`;
        const headers = {
            ...this.BASE_HEADERS[address],
            "Authorization": `Bearer ${this.accessTokens[address]}`,
            "Cookie": this.headerCookies[address]
        };
        let agent = null;
        if (proxy) {
            try {
                agent = new SocksProxyAgent(proxy);
            } catch (e) {
                this.log(`${Fore.RED}${Style.BRIGHT}Invalid Proxy URL: ${e.message}${Style.RESET_ALL}`);
                return null;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); 

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await axios.get(url, {
                    headers: headers,
                    timeout: 60000,
                    httpsAgent: agent,
                    httpAgent: agent,
                });
                return response.data;
            } catch (e) {
                if (attempt < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000)); 
                    continue;
                }
                this.log(
                    `${Fore.RED}${Style.BRIGHT}GET Task Lists Failed ${Style.RESET_ALL}` +
                    `${Fore.MAGENTA}${Style.BRIGHT}-${Style.RESET_ALL}` +
                    `${Fore.YELLOW}${Style.BRIGHT} ${e.message || e}${Style.RESET_ALL}`
                );
            }
        }
        return null;
    }

    async addPoints(address, taskId, title, proxy = null, retries = 5) {
        const url = `${this.BASE_API}/points/add`;
        const data = JSON.stringify({ taskId: taskId });
        const headers = {
            ...this.BASE_HEADERS[address],
            "Authorization": `Bearer ${this.accessTokens[address]}`,
            "Content-Length": Buffer.byteLength(data).toString(),
            "Content-Type": "application/json",
            "Cookie": this.headerCookies[address]
        };
        let agent = null;
        if (proxy) {
            try {
                agent = new SocksProxyAgent(proxy);
            } catch (e) {
                this.log(`${Fore.RED}${Style.BRIGHT}Invalid Proxy URL: ${e.message}${Style.RESET_ALL}`);
                return null;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 3000)); 

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await axios.post(url, data, {
                    headers: headers,
                    timeout: 60000,
                    httpsAgent: agent,
                    httpAgent: agent,
                });
                return response.data;
            } catch (e) {
                if (e.response && e.response.status === 409) {
                    this.log(
                        `${Fore.MAGENTA}${Style.BRIGHT}●${Style.RESET_ALL}` +
                        `${Fore.WHITE}${Style.BRIGHT}${title}${Style.RESET_ALL}` +
                        `${Fore.YELLOW}${Style.BRIGHT}Already Completed ${Style.RESET_ALL}`
                    );
                    return null;
                }
                if (attempt < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000)); 
                    continue;
                }
                this.log(
                    `${Fore.MAGENTA}${Style.BRIGHT}●${Style.RESET_ALL}` +
                    `${Fore.WHITE}${Style.BRIGHT}${title}${Style.RESET_ALL}` +
                    `${Fore.RED}${Style.BRIGHT}Not Completed ${Style.RESET_ALL}` +
                    `${Fore.MAGENTA}${Style.BRIGHT}-${Style.RESET_ALL}` +
                    `${Fore.YELLOW}${Style.BRIGHT} ${e.message || e}${Style.RESET_ALL}`
                );
            }
        }
        return null;
    }

    async processCheckConnection(address, useProxy, rotateProxy) {
        while (true) {
            const proxy = useProxy ? this.getNextProxyForAccount(address) : null;
            this.log(
                `${Fore.CYAN}${Style.BRIGHT}Proxy: ${Style.RESET_ALL}` +
                `${Fore.WHITE}${Style.BRIGHT}${proxy || 'N/A'} ${Style.RESET_ALL}`
            );

            const check = await this.checkConnection(proxy);
            if (check && check.status === "success") {
                return true;
            }

            if (rotateProxy) {
                this.rotateProxyForAccount(address); 
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            return false;
        }
    }

    async processGetNonce(address, useProxy, rotateProxy) {
        const isValid = await this.processCheckConnection(address, useProxy, rotateProxy);
        if (isValid) {
            const proxy = useProxy ? this.getNextProxyForAccount(address) : null;
            const initResult = await this.init(address, proxy);
            if (initResult) {
                const nonce = initResult.nonce;
                return nonce;
            }
        }
        return false;
    }

    async processUserLogin(privateKey, address, useProxy, rotateProxy) {
        const nonce = await this.processGetNonce(address, useProxy, rotateProxy);
        if (nonce) {
            const proxy = useProxy ? this.getNextProxyForAccount(address) : null;
            const loginResult = await this.authenticate(privateKey, address, nonce, proxy);
            if (loginResult) {
                this.privyId[address] = loginResult.user.id;
                this.accessTokens[address] = loginResult.token;
                this.identityTokens[address] = loginResult.identity_token;
                this.headerCookies[address] = `privy-token=${this.accessTokens[address]}; privy-id-token=${this.identityTokens[address]}`;

                this.log(
                    `${Fore.GREEN}${Style.BRIGHT}Login Success ${Style.RESET_ALL}`
                );
                return true;
            }
        }
        return false;
    }

    async processAccounts(privateKey, address, useProxy, rotateProxy) {
        const logined = await this.processUserLogin(privateKey, address, useProxy, rotateProxy);
        if (logined) {
            const proxy = useProxy ? this.getNextProxyForAccount(address) : null;

            await this.userVerify(address, proxy); 

            const taskLists = await this.taskLists(address, proxy);
            if (taskLists) {
                this.log(`${Fore.CYAN}${Style.BRIGHT}Task Lists:${Style.RESET_ALL}`);
                
                let allTasks = taskLists.filter(task => task); 
                taskLists.forEach(task => {
                    if (task.subtasks) {
                        allTasks.push(...task.subtasks.filter(subTask => subTask));
                    }
                });

                for (const task of allTasks) {
                    const taskId = task.id;
                    const title = task.title;
                    const reward = task.points;

                    const added = await this.addPoints(address, taskId, title, proxy);
                    if (added) {
                        this.log(
                            `${Fore.MAGENTA}${Style.BRIGHT}🟢${Style.RESET_ALL}` +
                            `${Fore.WHITE}${Style.BRIGHT}${title}${Style.RESET_ALL}` +
                            `${Fore.GREEN}${Style.BRIGHT} Is Completed ${Style.RESET_ALL}` +
                            `${Fore.MAGENTA}${Style.BRIGHT}-${Style.RESET_ALL}` +
                            `${Fore.CYAN}${Style.BRIGHT} Reward: ${Style.RESET_ALL}` +
                            `${Fore.WHITE}${Style.BRIGHT}${reward} PTS${Style.RESET_ALL}`
                        );
                    }
                }
            }
        }
    }

    async main() {
        let accounts = [];
        try {
            const data = await fs.readFile('accounts.txt', 'utf8');
            accounts = data.split('\n').map(line => line.trim()).filter(line => line);
        } catch (error) {
            this.log(`${Fore.RED}File 'accounts.txt' Not Found or cannot be read.${Style.RESET_ALL}`);
            return;
        }

        const { choose: useProxyChoice, rotate: rotateProxy } = await this.printQuestion();

        const useProxy = (useProxyChoice === 1); 

        while (true) {
            this.clearTerminal();
            this.welcome();
            this.log(
                `${Fore.GREEN}${Style.BRIGHT}Account's Total: ${Style.RESET_ALL}` +
                `${Fore.WHITE}${Style.BRIGHT}${accounts.length}${Style.RESET_ALL}`
            );

            if (useProxy) {
                await this.loadProxies(useProxyChoice);
            }


            for (const account of accounts) {
                if (account) {
                    const address = this.generateAddress(account);
                    if (address) { 
                        this.log(`${Fore.WHITE}${Style.BRIGHT}Wallet: ${this.maskAccount(address)}${Style.RESET_ALL}`);
                    } else {
                        this.log(
                            `${Fore.RED}${Style.BRIGHT}Invalid Private Key or Library Version Not Supported${Style.RESET_ALL}`
                        );
                        continue; 
                    }
            

                    const userAgent = USER_AGENT[Math.floor(Math.random() * USER_AGENT.length)];

                    this.PRIVY_HEADERS[address] = {
                        "Accept": "application/json",
                        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                        "Origin": "https://campaign.cicada.finance",
                        "Privy-App-Id": "cltgsatvl0uwg126o8osk48a3",
                        "Privy-Client-Id": "client-WY2ifxw6VQBxyc2wm9qFMambiP3khbmE57s6Dov2WVpDA",
                        "Referer": "https://campaign.cicada.finance/",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "cross-site",
                        "Sec-Fetch-Storage-Access": "active",
                        "User-Agent": userAgent
                    };

                    this.BASE_HEADERS[address] = {
                        "Accept": "*/*",
                        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                        "Origin": "https://campaign.cicada.finance",
                        "Referer": "https://campaign.cicada.finance/",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "same-origin",
                        "User-Agent": userAgent
                    };

                    await this.processAccounts(account, address, useProxy, rotateProxy);
                }
            }

            this.log(`${Fore.CYAN}${Style.BRIGHT}=${Style.RESET_ALL}`.repeat(72));

            let delay = 12 * 60 * 60; 
            while (delay > 0) {
                const formattedTime = this.formatSeconds(delay);
                process.stdout.write(
                    `${Fore.CYAN}${Style.BRIGHT}[ Wait for${Style.RESET_ALL}` +
                    `${Fore.WHITE}${Style.BRIGHT} ${formattedTime} ${Style.RESET_ALL}` +
                    `${Fore.CYAN}${Style.BRIGHT}... ]${Style.RESET_ALL}` +
                    `${Fore.WHITE}${Style.BRIGHT} | ${Style.RESET_ALL}` +
                    `${Fore.YELLOW}${Style.BRIGHT}All Accounts Have Been Processed${Style.RESET_ALL}\r` 
                );
                await new Promise(resolve => setTimeout(resolve, 1000));
                delay -= 1;
            }
            process.stdout.write('\n'); 
        }
    }
}


const bot = new Cicada();


process.on('SIGINT', () => {
    const now = new Date();
    const formattedTime = bot.wibFormatter.format(now);
    const [month, day, year] = formattedTime.split(',')[0].split('/');
    const timePart = formattedTime.split(',')[1].trim();
    const finalFormattedTime = `${month}/${day}/${year.slice(-2)} ${timePart} WIB`;

    console.log(
        `\n${Fore.CYAN}${Style.BRIGHT}[ ${finalFormattedTime} ]${Style.RESET_ALL}` +
        `${Fore.WHITE}${Style.BRIGHT} | ${Style.RESET_ALL}` +
        `${Fore.RED}${Style.BRIGHT}[ EXIT ] Cicada Auto bot${Style.RESET_ALL}                                         `
    );
    process.exit(0); 
});


(async () => {
    try {
        await bot.main();
    } catch (error) {
        bot.log(`${Fore.RED}${Style.BRIGHT}Error in main execution: ${error.message || error}${Style.RESET_ALL}`);
    }
})();
