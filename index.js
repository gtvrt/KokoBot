const Discord = require('discord.js');          
const client = new Discord.Client();                              
const embed = new Discord.RichEmbed();    
const Prefix = "!"  
const { getMember, formatDate } = require("./functions.js");
const { stripIndents } = require("common-tags");
const fs = require('fs');   
const { promptMessage } = require("./functions.js");
const token = process.env.arcadia;


client.on('ready', () => {
  console.clear();
  console.log(`Connected as ${client.user.tag} -- ${client.user.id}`);
  console.log("Ready...\n");
  client.user.setStatus('dnd');
  client.user.setPresence({
    status: "online",
    game: {
        name: "!help",
        type: "WATCHING"
    }
}); 
});

client.on('guildMemberAdd', () => {
    /*
    const MemberAdd = new embed()
    .setTitle(`Welcome`)
    .setDescription(`Hello! Welcome to Koko Cafe* Communication Server.\nPlease read the rules before interacting each channel.\nJoin the group if you haven't:\nhttps://www.roblox.com/groups/5284284/Koko-Cafe#!/about`)
    .setFooter(`Kokoclient`, client.user.displayAvatarURL)
    */
})

client.on('channelCreate', () => {
    
})

client.on('message', message => {

    let args = message.content.substring(Prefix.length).split(" ");
    if(message.channel.type == 'dm')return;

    let reason = args.slice(2).join(" ");
    let mutee = message.mentions.members.first() || message.guild.members.get(args[0])
    let mutedRole = message.guild.roles.find(r => r.name === "Muted")

    switch(args[0]){
        case 'help':
            const hellpp = new Discord.RichEmbed()
            .setDescription("**Kokoclient Guide**\nCommands: __**11**__\nInformation:\n`Help`|`List commands`|`!help`\n`Whois`|`List {user} Informations`|`!whois {user}`\n`Info`|`List Kokoclient info`|`!info`\nModerations:\n`Kick`|`Kick {user} out of the server`|`!kick {user} {reason}`\n`Ban`|`Ban {user} forever out the server`|`!ban {user} {reason}`\n`Mute`|`Remove the {user} speaking permissions.`|`!mute {user} {Value{Time}}`\n`Unmute`|`Undo the remove of the {user} speaking permissions.`|`!unmute {user}`\n`Warn`|`Send a warning to the {user}`|`!warn {user} {reason}`\nGroup(**For Admins Only**):\n`SetRank`|`Set {RBLXName} rank to {RankName}`|`!setrank {RBLXName} {RankName}`\n`GroupShout`|`Update GroupShout to {Text}`|`!groupshout {Text}`")
            .setFooter(`Kokoclient - V1.0`, client.user.displayAvatarURL)
            .setTimestamp()
            message.channel.send({embed: hellpp})
            break;
        case 'whois':
            const member = getMember(message, args[1]);

                    // Member variables
            const joined = formatDate(member.joinedAt);
            const roles = member.roles
                .filter(r => r.id !== message.guild.id)
                .map(r => r).join(", ") || 'none';
            
                    // User variables
                    const created = formatDate(member.user.createdAt);
            
                    const ANGEL = new Discord.RichEmbed()
                        .setFooter(member.displayName, member.user.displayAvatarURL)
                        .setThumbnail(member.user.displayAvatarURL)
                        .setColor(member.displayHexColor === '#000000' ? '#ffffff' : member.displayHexColor)
            
                        .addField('Member information:', stripIndents`**> Display name:** ${member.displayName}
                        **> Joined at:** ${joined}
                        **> Roles:** ${roles}`, true)
            
                        .addField('User information:', stripIndents`**> ID:** ${member.user.id}
                        **> Username**: ${member.user.username}
                        **> Tag**: ${member.user.tag}
                        **> Created at**: ${created}`)
                        
                        .setTimestamp()
            
                    if (member.user.presence.game) 
                        ANGEL.addField('Currently playing', stripIndents`**> Name:** ${member.user.presence.game.name}`);
            
                    message.channel.send({embed: ANGEL});
                    break;
            case 'ban':
                    const logChannel = message.guild.channels.find(c => c.name === "logs") || message.channel;

                    if (message.deletable) message.delete();
            
                    // No args
                    if (!args[0]) {
                        return message.reply("Please provide a person to ban.")
                            .then(m => m.delete(5000));
                    }
            
                    // No reason
                    if (!args[1]) {
                        return message.reply("Please provide a reason to ban.")
                            .then(m => m.delete(5000));
                    }
            
                    // No author permissions
                    if (!message.member.hasPermission("BAN_MEMBERS")) {
                        return message.reply("❌ You do not have permissions to ban members. Please contact a staff member")
                            .then(m => m.delete(5000));
                    
                    }
                    // No client permissions
                    if (!message.guild.me.hasPermission("BAN_MEMBERS")) {
                        return message.reply("❌ I do not have permissions to ban members. Please contact a staff member")
                            .then(m => m.delete(5000));
                    }
            
                    const toBan = message.mentions.members.first() || message.guild.members.get(args[0]);
            
                    // No member found
                    if (!toBan) {
                        return message.reply("Couldn't find that member, try again")
                            .then(m => m.delete(5000));
                    }
            
                    // Can't ban urself
                    if (toBan.id === message.author.id) {
                        return message.reply("You can't ban yourself...")
                            .then(m => m.delete(5000));
                    }
            
                    // Check if the user's banable
                    if (!toBan.bannable) {
                        return message.reply("I can't ban that person due to role hierarchy, I suppose.")
                            .then(m => m.delete(5000));
                    }
                    
                    const embed = new Discord.RichEmbed()
                        .setColor("#ff0000")
                        .setThumbnail(toBan.user.displayAvatarURL)
                        .setFooter(message.member.displayName, message.author.displayAvatarURL)
                        .setTimestamp()
                        .setDescription(stripIndents`**> Banned member:** ${toBan} (${toBan.id})
                        **> Banned by:** ${message.member} (${message.member.id})
                        **> Reason:** ${args.slice(1).join(" ")}`);
            
                    const promptEmbed = new Discord.RichEmbed()
                        .setColor("GREEN")
                        .setAuthor(`This verification becomes invalid after 30s.`)
                        .setDescription(`Do you want to ban ${toBan}?`)
            
                    // Send the message
                     message.channel.send(promptEmbed).then(async msg => {
                        // Await the reactions and the reactioncollector
                        const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);
            
                        // Verification stuffs
                        if (emoji === "✅") {
                            msg.delete();
            
                            toBan.ban(args.slice(1).join(" "))
                                .catch(err => {
                                    if (err) return message.channel.send(`Well.... the ban didn't work out. Here's the error ${err}`)
                                });
            
                            logChannel.send(embed);
                        } else if (emoji === "❌") {
                            msg.delete();
            
                            message.reply(`ban canceled.`)
                                .then(m => m.delete(10000));
                        }
                    });
                    break;
        case 'kick':
                const logChannell = message.guild.channels.find(c => c.name === "logs") || message.channel;

                if (message.deletable) message.delete();
        
                // No args
                if (!args[0]) {
                    return message.reply("Please provide a person to kick.")
                        .then(m => m.delete(5000));
                }
        
                // No reason
                if (!args[1]) {
                    return message.reply("Please provide a reason to kick.")
                        .then(m => m.delete(5000));
                }
        
                // No author permissions
                if (!message.member.hasPermission("KICK_MEMBERS")) {
                    return message.reply("❌ You do not have permissions to kick members. Please contact a staff member")
                        .then(m => m.delete(5000));
                }
        
                // No client permissions
                if (!message.guild.me.hasPermission("KICK_MEMBERS")) {
                    return message.reply("❌ I do not have permissions to kick members. Please contact a staff member")
                        .then(m => m.delete(5000));
                }
        
                const toKick = message.mentions.members.first() || message.guild.members.get(args[0]);
        
                // No member found
                if (!toKick) {
                    return message.reply("Couldn't find that member, try again")
                        .then(m => m.delete(5000));
                }
        
                // Can't kick urself
                if (toKick.id === message.author.id) {
                    return message.reply("You can't kick yourself...")
                        .then(m => m.delete(5000));
                }
        
                // Check if the user's kickable
                if (!toKick.kickable) {
                    return message.reply("I can't kick that person due to role hierarchy, I suppose.")
                        .then(m => m.delete(5000));
                }
                        
                const embedd = new Discord.RichEmbed()
                    .setColor("#ff0000")
                    .setThumbnail(toKick.user.displayAvatarURL)
                    .setFooter(message.member.displayName, message.author.displayAvatarURL)
                    .setTimestamp()
                    .setDescription(stripIndents`**> Kicked member:** ${toKick} (${toKick.id})
                    **> Kicked by:** ${message.member} (${message.member.id})
                    **> Reason:** ${args.slice(1).join(" ")}`);
        
                const ppromptEmbed = new Discord.RichEmbed()
                    .setColor("GREEN")
                    .setAuthor(`This verification becomes invalid after 30s.`)
                    .setDescription(`Do you want to kick ${toKick}?`)
        
                // Send the message
                message.channel.send(ppromptEmbed).then(async msg => {
                    // Await the reactions and the reaction collector
                    const emoji = await promptMessage(msg, message.author, 30, ["✅", "❌"]);
        
                    // The verification stuffs
                    if (emoji === "✅") {
                        msg.delete();
        
                        toKick.kick(args.slice(1).join(" "))
                            .catch(err => {
                                if (err) return message.channel.send(`Well.... the kick didn't work out. Here's the error ${err}`)
                            });
        
                        logChannell.send(embedd);
                    } else if (emoji === "❌") {
                        msg.delete();
        
                        message.reply(`Kick canceled.`)
                            .then(m => m.delete(10000));
                    }
                });
                break;
        case 'mute':
                let noPermission = new Discord.RichEmbed()
                .setAuthor(`No Permission`, message.guild.iconURL)
                .setColor(0x421C52)
                .setDescription(`${message.author}, I don't have permission to add roles, contact the staff!`)
                .setFooter(`Check in the mute.js file if there is an error!`, client.user.displayAvatarURL)
            if(!message.member.roles.find(r => r.name === "Moderation")) return message.channel.send(noPermission)
            if(!message.member.roles.some(r=>["Moderation", "Elves"].includes(r.name)) ){
                let mutePermission = new Discord.RichEmbed()
                .setAuthor(`No Permission`, message.guild.iconURL)
                .setColor(0x421C52)
                .setDescription(`${message.author}, you do not have permission to use this command!`)
                .setFooter(`Check in the mute.js file if there is an error!`, client.user.displayAvatarURL)
                message.channel.send(mutePermission)
            }
                if(!mutee) return message.channel.send('You have to @ a user in this discord!')
                
                if(!reason) reason = "No reason given"
        
                if(!mutedRole) {
                    try{
                        mutedRole =  message.guild.createRole({
                            name: "Muted",
                            color: "#131212",
                            permissions: []
                        })
                        message.guild.channels.forEach(async (channel, id) => {
                            await channel.overwritePermissions(mutedRole, {
                                SEND_MESSAGES: false,
                                ADD_REACTIONS: false,
                                SEND_TTS_MESSAGES: false,
                                ATTACH_FILES: false,
                                SPEAK: false,
                            })
                        })
                    } catch(e) {
                        console.log(e.stack);
                    }
                }
            mutee.addRole(mutedRole.id).then(() => {
                message.delete()
                let mutePing = new Discord.RichEmbed()
                .setAuthor(`Muted`, message.guild.iconURL)
                .setColor(0x421C52)
                .setDescription(`${message.author}, you have been muted for: ${reason}!`)
                .setFooter(`Check in the mute.js file if there is an error!`, client.user.displayAvatarURL)
                mutee.send(mutePing)
                let channelmutePing = new Discord.RichEmbed()
                .setAuthor(`Muted`, message.guild.iconURL)
                .setColor(0x421C52)
                .setDescription(`${message.author}, has been muted for: ${reason}!`)
                .setFooter(`Check in the mute.js file if there is an error!`, client.user.displayAvatarURL)
                message.channel.send(channelmutePing)
            })
            var muteLog = message.guild.channels.find(channel => channel.name === `logs`);
                let mutedLog = new Discord.RichEmbed()
                .setAuthor(`Mute Logs`, message.guild.iconURL)
                .setColor(0x421C52)
                .addField('Muted:', `${mutee.user.username}`)
                .addField('Moderator:', message.author.username)
                .addField('Reason:', reason)
                .addField('Date:', message.createdAt.toLocaleString())
                .setFooter(`Check in the mute.js file if there is an error!`, client.user.displayAvatarURL)
                muteLog.send(mutedLog)
                break;
        case 'unmute':
                let nooPermission = new Discord.RichEmbed()
                .setAuthor(`No Permission`, message.guild.iconURL)
                .setColor(0x421C52)
                .setDescription(`${message.author}, I don't have permission to add roles, contact the staff!`)
                .setFooter(`Check in the mute.js file if there is an error!`, client.user.displayAvatarURL)
            if(!message.member.roles.find(r => r.name === "Moderation")) return message.channel.send(nooPermission)
            if(!message.member.roles.some(r=>["Moderation", "Elves"].includes(r.name)) ){
                let mutePermission = new Discord.RichEmbed()
                .setAuthor(`No Permission`, message.guild.iconURL)
                .setColor(0x421C52)
                .setDescription(`${message.author}, you do not have permission to use this command!`)
                .setFooter(`Check in the mute.js file if there is an error!`, client.user.displayAvatarURL)
                message.channel.send(mutePermission)
            }
            let muteee = message.mentions.members.first() || message.guild.members.get(args[0])
                if(!muteee) return message.channel.send('You have to @ a user in this discord!')
                if(!reason) reason = "No reason given"
            if(!mutedRole) return message.channel.send('The user you @ is not muted!')
            muteee.removeRole(mutedRole.id).then(() => {
                message.delete()
                let unmutePing = new Discord.RichEmbed()
                    .setAuthor(`UnMuted`, message.guild.iconURL)
                    .setColor(0x421C52)
                    .setDescription(`${message.author}, you have been unmuted for: ${reason}!`)
                    .setFooter(`Check in the unmute.js file if there is an error!`, client.user.displayAvatarURL)
                muteee.send(unmutePing).catch(err => console.log(err))
                let channelunmutePing = new Discord.RichEmbed()
                .setAuthor(`UnMuted`, message.guild.iconURL)
                .setColor(0x421C52)
                .setDescription(`${message.author}, has been unmuted for: ${reason}!`)
                .setFooter(`Check in the unmute.js file if there is an error!`, client.user.displayAvatarURL)
                message.channel.send(channelunmutePing)
            })
            var unmuteLog = message.guild.channels.find(channel => channel.name === "logs"); // Change this to your moderation logging channel
                let unmutedLog = new Discord.RichEmbed()
                .setAuthor(`UnMuted Logs`, message.guild.iconURL)
                .setColor(0x421C52)
                .addField('UnMuted:', `${mutee.user.username}`)
                .addField('Moderator:', message.author.username)
                .addField('Reason:', reason)
                .addField('Date:', message.createdAt.toLocaleString())
                .setFooter(`Check in the unmute.js file if there is an error!`, client.user.displayAvatarURL)
                unmuteLog.send(unmutedLog)
            break;
    }
        });

client.login(token);

