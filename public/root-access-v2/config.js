window.RA_CONFIG = {
  "schema": 1,
  "taps": {
    "enabled": true,
    "rate": 0.25,
    "minMoney": 1,
    "advance": 0.25
  },
  "bar": {
    "enabled": true,
    "steps": 10,
    "bonusTaps": 15,
    "speed": 0.25,
    "speedDur": 12
  },
  "jobs": {
    "enabled": true,
    "maxLevel": 50,
    "milestones": [],
    "revealAt": 0.6,
    "list": [
      {
        "id": "wifi",
        "name": "Guess a neighbor's Wi-Fi password",
        "time": 6,
        "pay": 2,
        "cost": 5,
        "r": 1.2,
        "rep": 3,
        "unlock": 0
      },
      {
        "id": "ceo",
        "name": "Sell a cracked streaming account",
        "time": 15,
        "pay": 8,
        "cost": 40,
        "r": 1.2,
        "rep": 9,
        "unlock": 25
      },
      {
        "id": "dms",
        "name": "Recover a locked phone for cash",
        "time": 30,
        "pay": 30,
        "cost": 250,
        "r": 1.2,
        "rep": 30,
        "unlock": 400
      },
      {
        "id": "bank",
        "name": "Hack a kebab shop's loyalty app",
        "time": 60,
        "pay": 120,
        "cost": 1500,
        "r": 1.2,
        "rep": 90,
        "unlock": 6000
      },
      {
        "id": "cams",
        "name": "Ransom a dentist's office PC",
        "time": 120,
        "pay": 500,
        "cost": 8000,
        "r": 1.2,
        "rep": 300,
        "unlock": 60000
      },
      {
        "id": "sat",
        "name": "Crash a local radio station",
        "time": 240,
        "pay": 2000,
        "cost": 40000,
        "r": 1.2,
        "rep": 900,
        "unlock": 350000
      }
    ]
  },
  "rigs": {
    "enabled": true,
    "list": [
      {
        "job": "wifi",
        "name": "Wi-Fi cracking script",
        "cost": 1200
      },
      {
        "job": "ceo",
        "name": "Account checker bot",
        "cost": 6000
      },
      {
        "job": "dms",
        "name": "Phone unlock kit",
        "cost": 25000
      },
      {
        "job": "bank",
        "name": "Loyalty app exploit",
        "cost": 120000
      },
      {
        "job": "cams",
        "name": "Ransomware kit",
        "cost": 600000
      },
      {
        "job": "sat",
        "name": "Transmitter hijack rig",
        "cost": 2500000
      }
    ]
  },
  "racks": {
    "enabled": true,
    "largeSlots": 3,
    "decorSlots": 3,
    "cost": 60,
    "r": 50,
    "holds": 3
  },
  "items": {
    "enabled": true,
    "maxLevel": 25,
    "r": 1.5,
    "growPerLevel": 0.2,
    "techComfortFlat": true,
    "list": [
      {
        "id": "gpu",
        "type": "tech",
        "size": "large",
        "name": "Old laptop",
        "cost": 80,
        "comfort": 1,
        "pay": 1.15
      },
      {
        "id": "fiber",
        "type": "tech",
        "size": "small",
        "name": "ISP box",
        "cost": 40,
        "comfort": 2,
        "speed": 1.2
      },
      {
        "id": "server",
        "type": "tech",
        "size": "large",
        "name": "Workstation",
        "cost": 4500,
        "comfort": 3,
        "pay": 2
      },
      {
        "id": "cooler",
        "type": "tech",
        "size": "large",
        "name": "Tower Unit",
        "cost": 9000,
        "comfort": 4,
        "speed": 2
      },
      {
        "id": "quantum",
        "type": "tech",
        "size": "small",
        "name": "Fiber line",
        "cost": 1200,
        "comfort": 5,
        "speed": 1.5
      },
      {
        "id": "lamp",
        "type": "decor",
        "name": "Lava lamp",
        "cost": 30,
        "comfort": 2,
        "event": {
          "boost": 3,
          "dur": 30
        }
      },
      {
        "id": "plant",
        "type": "decor",
        "name": "Plant",
        "cost": 25,
        "comfort": 2,
        "event": {
          "boost": 3,
          "dur": 30
        }
      },
      {
        "id": "phones",
        "type": "decor",
        "name": "Headphones",
        "cost": 700,
        "comfort": 10,
        "event": {
          "boost": 15,
          "dur": 30
        }
      },
      {
        "id": "cat",
        "type": "decor",
        "name": "Cat",
        "cost": 300,
        "comfort": 10,
        "event": {
          "boost": 20,
          "dur": 30
        }
      },
      {
        "id": "gf",
        "type": "decor",
        "name": "Girlfriend",
        "cost": 2500,
        "comfort": 20,
        "event": {
          "boost": 100,
          "dur": 15
        }
      }
    ]
  },
  "events": {
    "enabled": true,
    "window": 20,
    "first": 15,
    "min": 60,
    "max": 120,
    "acceptRate": 0.7
  },
  "offline": {
    "enabled": true,
    "capHours": 8
  }
};
